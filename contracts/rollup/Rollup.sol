// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IRollup} from "./IRollup.sol";
import {IL2ScrollMessenger} from "@scroll-tech/contracts/L2/IL2ScrollMessenger.sol";
import {IContribution} from "../contribution/IContribution.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {DepositTreeLib} from "./lib/DepositTreeLib.sol";
import {BlockHashLib} from "./lib/BlockHashLib.sol";
import {PairingLib} from "./lib/PairingLib.sol";
import {RateLimiterLib} from "./lib/RateLimiterLib.sol";

/**
 * @title Rollup
 * @notice Implementation of the Intmax2 L2 rollup contract
 * @dev Manages block submission, deposit processing, and maintains the state of the rollup chain
 */
contract Rollup is IRollup, OwnableUpgradeable, UUPSUpgradeable {
	using BlockHashLib for bytes32[];
	using DepositTreeLib for DepositTreeLib.DepositTree;
	using RateLimiterLib for RateLimiterLib.RateLimitState;

	/**
	 * @notice The maximum number of senders in a block
	 * @dev Used to limit the size of blocks and for padding sender arrays
	 */
	uint256 public constant NUM_SENDERS_IN_BLOCK = 128;
	/**
	 * @notice The number of bytes required to represent the account IDs of all senders in a block
	 * @dev Each account ID uses 5 bytes, so 128 senders require 640 bytes
	 */
	uint256 public constant FULL_ACCOUNT_IDS_BYTES = NUM_SENDERS_IN_BLOCK * 5;

	/**
	 * @notice Address of the Liquidity contract on L1
	 * @dev Used to verify cross-chain messages from the Liquidity contract
	 */
	address public liquidity;

	/**
	 * @notice The ID of the last processed deposit from the Liquidity contract
	 * @dev Used to track which deposits have been included in the deposit tree
	 */
	uint256 public lastProcessedDepositId;

	/**
	 * @notice Array of block hashes in the rollup chain
	 * @dev Index 0 contains the genesis block hash
	 */
	bytes32[] public blockHashes;

	/**
	 * @notice Mapping of block builder addresses to their current nonce for registration blocks
	 * @dev Used to prevent replay attacks and ensure block ordering
	 */
	mapping(address => uint32) public builderRegistrationNonce;

	/**
	 * @notice Mapping of block builder addresses to their current nonce for non-registration blocks
	 * @dev Used to prevent replay attacks and ensure block ordering
	 */
	mapping(address => uint32) public builderNonRegistrationNonce;

	/**
	 * @notice Reference to the L2 ScrollMessenger contract
	 * @dev Used for cross-chain communication with L1
	 */
	IL2ScrollMessenger public l2ScrollMessenger;

	/**
	 * @notice Reference to the Contribution contract
	 * @dev Used to record block builder contributions
	 */
	IContribution public contribution;

	/**
	 * @notice Sparse Merkle tree for tracking deposits
	 * @dev Maintains a cryptographic commitment to all processed deposits
	 */
	DepositTreeLib.DepositTree private depositTree;

	/**
	 * @notice State for the rate limiter that controls block submission frequency
	 * @dev Uses exponential moving average to calculate penalties for rapid submissions
	 */
	RateLimiterLib.RateLimitState private rateLimitState;

	/**
	 * @notice Current root of the deposit Merkle tree
	 * @dev Updated whenever new deposits are processed
	 */
	bytes32 public depositTreeRoot;

	/**
	 * @notice Current index for the next deposit in the deposit tree
	 * @dev Incremented for each processed deposit
	 */
	uint32 public depositIndex;

	bool public isMigrationCompleted;

	/**
	 * @notice Modifier to restrict function access to the Liquidity contract via ScrollMessenger
	 * @dev Verifies that the message sender is the ScrollMessenger and the xDomain sender is the Liquidity contract
	 */
	modifier onlyLiquidityContract() {
		IL2ScrollMessenger l2ScrollMessengerCached = l2ScrollMessenger;
		if (_msgSender() != address(l2ScrollMessengerCached)) {
			revert OnlyScrollMessenger();
		}
		if (liquidity != l2ScrollMessengerCached.xDomainMessageSender()) {
			revert OnlyLiquidity();
		}
		_;
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initializes the Rollup contract
	 * @dev Sets up the initial state with admin, ScrollMessenger, Liquidity, and Contribution contracts
	 * @param _admin Address that will be granted ownership of the contract
	 * @param _scrollMessenger Address of the L2 ScrollMessenger contract
	 * @param _liquidity Address of the Liquidity contract on L1
	 * @param _contribution Address of the Contribution contract
	 * @param _rateLimitThresholdInterval The threshold interval between block submissions
	 * @param _rateLimitAlpha The smoothing factor for the exponential moving average
	 * @param _rateLimitK The penalty coefficient for the rate limiter
	 */
	function initialize(
		address _admin,
		address _scrollMessenger,
		address _liquidity,
		address _contribution,
		uint256 _rateLimitThresholdInterval,
		uint256 _rateLimitAlpha,
		uint256 _rateLimitK
	) external initializer {
		if (
			_admin == address(0) ||
			_scrollMessenger == address(0) ||
			_liquidity == address(0) ||
			_contribution == address(0)
		) {
			revert AddressZero();
		}
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
		depositTree.initialize();
		l2ScrollMessenger = IL2ScrollMessenger(_scrollMessenger);
		liquidity = _liquidity;
		contribution = IContribution(_contribution);

		rateLimitState.setConstants(
			_rateLimitThresholdInterval,
			_rateLimitAlpha,
			_rateLimitK
		);
		depositTreeRoot = depositTree.getRoot();
		blockHashes.pushGenesisBlockHash(depositTreeRoot);
	}

	function postRegistrationBlock(
		bytes32 txTreeRoot,
		uint64 expiry,
		uint32 builderNonce,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		uint256[] calldata senderPublicKeys
	) external payable {
		if (expiry != 0 && expiry <= block.timestamp) {
			revert Expired();
		}
		_collectPenaltyFee();
		BlockPostData memory blockPostData = BlockPostData({
			isRegistrationBlock: true,
			txTreeRoot: txTreeRoot,
			expiry: expiry,
			builderAddress: _msgSender(),
			builderNonce: builderNonce,
			senderFlags: senderFlags
		});
		uint256 length = senderPublicKeys.length;
		if (length > NUM_SENDERS_IN_BLOCK) {
			revert TooManySenderPublicKeys();
		}

		uint256[NUM_SENDERS_IN_BLOCK] memory paddedKeys;
		for (uint256 i = 0; i < length; i++) {
			paddedKeys[i] = senderPublicKeys[i];
		}
		for (uint256 i = length; i < NUM_SENDERS_IN_BLOCK; i++) {
			paddedKeys[i] = 1;
		}
		bytes32 publicKeysHash = keccak256(abi.encodePacked(paddedKeys));
		bytes32 accountIdsHash = 0;
		_postBlock(
			blockPostData,
			publicKeysHash,
			accountIdsHash,
			aggregatedPublicKey,
			aggregatedSignature,
			messagePoint
		);
	}

	function postNonRegistrationBlock(
		bytes32 txTreeRoot,
		uint64 expiry,
		uint32 builderNonce,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		bytes32 publicKeysHash,
		bytes calldata senderAccountIds
	) external payable {
		if (expiry != 0 && expiry <= block.timestamp) {
			revert Expired();
		}
		_collectPenaltyFee();
		BlockPostData memory blockPostData = BlockPostData({
			isRegistrationBlock: false,
			txTreeRoot: txTreeRoot,
			expiry: expiry,
			builderAddress: _msgSender(),
			builderNonce: builderNonce,
			senderFlags: senderFlags
		});
		uint256 length = senderAccountIds.length;
		if (length > FULL_ACCOUNT_IDS_BYTES) {
			revert TooManyAccountIds();
		}
		if (length % 5 != 0) {
			revert SenderAccountIdsInvalidLength();
		}
		bytes memory paddedAccountIds = new bytes(FULL_ACCOUNT_IDS_BYTES);
		for (uint256 i = 0; i < length; i++) {
			paddedAccountIds[i] = senderAccountIds[i];
		}
		// Pad with 5-byte representation of 1 (0x0000000001)
		for (uint256 i = length; i < FULL_ACCOUNT_IDS_BYTES; i += 5) {
			paddedAccountIds[i + 4] = 0x01;
		}
		bytes32 accountIdsHash = keccak256(paddedAccountIds);
		_postBlock(
			blockPostData,
			publicKeysHash,
			accountIdsHash,
			aggregatedPublicKey,
			aggregatedSignature,
			messagePoint
		);
	}

	function processDeposits(
		uint256 _lastProcessedDepositId,
		bytes32[] calldata depositHashes
	) external onlyLiquidityContract {
		uint32 depositIndexCached = depositIndex;
		for (uint256 i = 0; i < depositHashes.length; i++) {
			depositTree.deposit(depositHashes[i]);
			emit DepositLeafInserted(depositIndexCached, depositHashes[i]);
			depositIndexCached++;
		}
		depositIndex = depositIndexCached;
		lastProcessedDepositId = _lastProcessedDepositId;
		bytes32 newDepositTreeRoot = depositTree.getRoot();
		depositTreeRoot = newDepositTreeRoot;
		emit DepositsProcessed(_lastProcessedDepositId, newDepositTreeRoot);
	}

	/**
	 * @notice Internal function to post a new block to the rollup chain
	 * @dev Verifies the block data, updates state, and emits events
	 * @param blockPostData Struct containing block data
	 * @param publicKeysHash Hash of the sender public keys
	 * @param accountIdsHash Hash of the sender account IDs
	 * @param aggregatedPublicKey The aggregated public key for signature verification
	 * @param aggregatedSignature The aggregated signature to verify
	 * @param messagePoint The message point for pairing check
	 */
	function _postBlock(
		BlockPostData memory blockPostData,
		bytes32 publicKeysHash,
		bytes32 accountIdsHash,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint
	) private {
		// Bypass nonce check if nonce is 0
		if (blockPostData.builderNonce != 0) {
			if (blockPostData.isRegistrationBlock) {
				uint32 previousNonce = builderRegistrationNonce[
					blockPostData.builderAddress
				];
				if (blockPostData.builderNonce < previousNonce) {
					revert InvalidNonce();
				}
				builderRegistrationNonce[blockPostData.builderAddress] =
					blockPostData.builderNonce +
					1;
			} else {
				uint32 previousNonce = builderNonRegistrationNonce[
					blockPostData.builderAddress
				];
				if (blockPostData.builderNonce < previousNonce) {
					revert InvalidNonce();
				}
				builderNonRegistrationNonce[blockPostData.builderAddress] =
					blockPostData.builderNonce +
					1;
			}
		}
		bool success = PairingLib.pairing(
			aggregatedPublicKey,
			aggregatedSignature,
			messagePoint
		);
		if (!success) {
			revert PairingCheckFailed();
		}

		bytes32 signatureHash = keccak256(
			abi.encodePacked(
				uint32(blockPostData.isRegistrationBlock ? 1 : 0),
				blockPostData.txTreeRoot,
				blockPostData.expiry,
				blockPostData.builderAddress,
				blockPostData.builderNonce,
				blockPostData.senderFlags,
				publicKeysHash,
				accountIdsHash,
				aggregatedPublicKey,
				aggregatedSignature,
				messagePoint
			)
		);
		uint32 blockNumber = blockHashes.getBlockNumber();
		bytes32 prevBlockHash = blockHashes.getPrevHash();
		bytes32 depositTreeRootCached = depositTreeRoot;
		uint64 timestamp = uint64(block.timestamp);
		blockHashes.pushBlockHash(
			depositTreeRootCached,
			signatureHash,
			timestamp
		);
		emit BlockPosted(
			prevBlockHash,
			_msgSender(),
			timestamp,
			blockNumber,
			depositTreeRootCached,
			signatureHash
		);

		contribution.recordContribution(
			keccak256("POST_BLOCK"),
			_msgSender(),
			1
		);
	}

	/**
	 * @notice Collects the penalty fee for rate limiting
	 * @dev Updates the rate limiter state, verifies sufficient fee, and refunds excess
	 */
	function _collectPenaltyFee() private {
		uint256 penalty = rateLimitState.update();
		if (penalty > msg.value) {
			revert InsufficientPenaltyFee();
		}
		// refund the excess fee
		uint256 excessFee = msg.value - penalty;
		if (excessFee > 0) {
			payable(_msgSender()).transfer(excessFee);
		}
	}

	/**
	 * @notice Sets the rate limiter constants for the rollup chain
	 * @dev Can only be called by the contract owner
	 * @param targetInterval The target block submission interval in seconds
	 * @param alpha The alpha value for the exponential moving average
	 * @param k The penalty coefficient for the rate limiter
	 */
	function setRateLimitConstants(
		uint256 targetInterval,
		uint256 alpha,
		uint256 k
	) external onlyOwner {
		rateLimitState.setConstants(targetInterval, alpha, k);
	}

	function withdrawPenaltyFee(address to) external onlyOwner {
		payable(to).transfer(address(this).balance);
	}

	function getLatestBlockNumber() external view returns (uint32) {
		return blockHashes.getBlockNumber() - 1;
	}

	function getBlockHash(uint32 blockNumber) external view returns (bytes32) {
		if (blockNumber >= blockHashes.getBlockNumber()) {
			revert BlockNumberOutOfRange();
		}
		return blockHashes[blockNumber];
	}

	function getPenalty() external view returns (uint256) {
		return rateLimitState.getPenalty();
	}

	/**
	 * @notice Authorizes an upgrade to a new implementation
	 * @dev Can only be called by the contract owner
	 * @param newImplementation Address of the new implementation contract
	 */
	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyOwner {}
}
