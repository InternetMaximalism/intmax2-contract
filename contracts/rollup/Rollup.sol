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

contract Rollup is IRollup, OwnableUpgradeable, UUPSUpgradeable {
	using BlockHashLib for bytes32[];
	using DepositTreeLib for DepositTreeLib.DepositTree;
	using RateLimiterLib for RateLimiterLib.RateLimitState;

	uint256 private constant NUM_SENDERS_IN_BLOCK = 128;
	uint256 private constant FULL_ACCOUNT_IDS_BYTES = NUM_SENDERS_IN_BLOCK * 5;

	address private liquidity;
	uint256 public lastProcessedDepositId;
	bytes32[] public blockHashes;
	address[] public blockBuilders;

	IL2ScrollMessenger private l2ScrollMessenger;
	IContribution private contribution;
	DepositTreeLib.DepositTree private depositTree;
	RateLimiterLib.RateLimitState private rateLimitState;
	bytes32 public depositTreeRoot;
	uint32 public depositIndex;

	modifier onlyLiquidityContract() {
		IL2ScrollMessenger l2ScrollMessengerCached = l2ScrollMessenger;
		// note
		// The specification of ScrollMessenger may change in the future.
		// https://docs.scroll.io/en/developers/l1-and-l2-bridging/the-scroll-messenger/

		// The L2 scrollMessenger is now the sender,
		// but the sendMessage executor of the L1 scrollMessenger will eventually
		// be set as the sender, so the following source needs to be modified at that time
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

	function initialize(
		address _admin,
		address _scrollMessenger,
		address _liquidity,
		address _contribution
	) external initializer {
		if (_admin == address(0)) {
			revert AddressZero();
		}
		if (_scrollMessenger == address(0)) {
			revert AddressZero();
		}
		if (_liquidity == address(0)) {
			revert AddressZero();
		}
		if (_contribution == address(0)) {
			revert AddressZero();
		}
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
		depositTree.initialize();
		l2ScrollMessenger = IL2ScrollMessenger(_scrollMessenger);
		liquidity = _liquidity;
		contribution = IContribution(_contribution);

		depositTreeRoot = depositTree.getRoot();
		blockHashes.pushGenesisBlockHash(depositTreeRoot);
		blockBuilders.push(address(0));
	}

	function postRegistrationBlock(
		bytes32 txTreeRoot,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		uint256[] calldata senderPublicKeys
	) external payable {
		collectPenaltyFee();
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
			true,
			txTreeRoot,
			senderFlags,
			publicKeysHash,
			accountIdsHash,
			aggregatedPublicKey,
			aggregatedSignature,
			messagePoint
		);
	}

	function postNonRegistrationBlock(
		bytes32 txTreeRoot,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		bytes32 publicKeysHash,
		bytes calldata senderAccountIds
	) external payable {
		collectPenaltyFee();
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
			false,
			txTreeRoot,
			senderFlags,
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

	function _postBlock(
		bool isRegistrationBlock,
		bytes32 txTreeRoot,
		bytes16 senderFlags,
		bytes32 publicKeysHash,
		bytes32 accountIdsHash,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint
	) private {
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
				uint32(isRegistrationBlock ? 1 : 0),
				txTreeRoot,
				senderFlags,
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
		blockHashes.pushBlockHash(depositTreeRootCached, signatureHash);
		blockBuilders.push(_msgSender());
		emit BlockPosted(
			prevBlockHash,
			_msgSender(),
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

	function collectPenaltyFee() private {
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

	function withdrawPenaltyFee(address to) external onlyOwner {
		payable(to).transfer(address(this).balance);
	}

	function getLatestBlockNumber() external view returns (uint32) {
		return blockHashes.getBlockNumber() - 1;
	}

	function getBlockBuilder(
		uint32 blockNumber
	) external view returns (address) {
		if (blockNumber >= blockHashes.getBlockNumber()) {
			revert BlockNumberOutOfRange();
		}
		return blockBuilders[blockNumber];
	}

	function getBlockHash(uint32 blockNumber) external view returns (bytes32) {
		if (blockNumber >= blockHashes.getBlockNumber()) {
			revert BlockNumberOutOfRange();
		}
		return blockHashes[blockNumber];
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
