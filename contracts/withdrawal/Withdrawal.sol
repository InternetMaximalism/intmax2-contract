// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IWithdrawal} from "./IWithdrawal.sol";
import {IPlonkVerifier} from "../common/IPlonkVerifier.sol";
import {ILiquidity} from "../liquidity/ILiquidity.sol";
import {IRollup} from "../rollup/IRollup.sol";
import {IContribution} from "../contribution/IContribution.sol";
import {IL2ScrollMessenger} from "@scroll-tech/contracts/L2/IL2ScrollMessenger.sol";
import {IMigration} from "../common/IMigration.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {WithdrawalProofPublicInputsLib} from "./lib/WithdrawalProofPublicInputsLib.sol";
import {ChainedWithdrawalLib} from "./lib/ChainedWithdrawalLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {Byte32Lib} from "../common/Byte32Lib.sol";

/**
 * @title Withdrawal
 * @notice Contract for processing withdrawals from L2 to L1 in the Intmax2 protocol
 * @dev Handles verification of withdrawal proofs and relays withdrawal information to the Liquidity contract on L1
 */
contract Withdrawal is
	IWithdrawal,
	IMigration,
	UUPSUpgradeable,
	OwnableUpgradeable
{
	using EnumerableSet for EnumerableSet.UintSet;
	using WithdrawalLib for WithdrawalLib.Withdrawal;
	using ChainedWithdrawalLib for ChainedWithdrawalLib.ChainedWithdrawal[];
	using WithdrawalProofPublicInputsLib for WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs;
	using Byte32Lib for bytes32;

	/// @notice Maximum number of withdrawals that can be relayed in a single transaction
	/// @dev This limit prevents situations where too many withdrawals are relayed to L1 simultaneously,
	/// @dev which could exceed the L1 block gas limit and cause transaction failures.
	uint256 public constant RELAY_LIMIT = 100;

	/**
	 * @notice Reference to the PLONK verifier contract for withdrawal proofs
	 * @dev Used to verify zero-knowledge proofs of withdrawals
	 */
	IPlonkVerifier public withdrawalVerifier;

	/**
	 * @notice Reference to the L2 ScrollMessenger contract
	 * @dev Used for cross-chain communication with L1
	 */
	IL2ScrollMessenger public l2ScrollMessenger;

	/**
	 * @notice Reference to the Rollup contract
	 * @dev Used to verify block hashes for withdrawals
	 */
	IRollup public rollup;

	/**
	 * @notice Address of the Liquidity contract on L1
	 * @dev Target for cross-chain messages about withdrawals
	 */
	address public liquidity;

	/**
	 * @notice Reference to the Contribution contract
	 * @dev Used to record withdrawal contributions
	 */
	IContribution public contribution;

	/**
	 * @notice Mapping of nullifiers to their used status
	 * @dev Prevents double-spending of withdrawals
	 */
	mapping(bytes32 => bool) public nullifiers;

	/**
	 * @notice Set of token indices that can be withdrawn directly
	 * @dev Tokens not in this set will be processed as claimable withdrawals
	 */
	EnumerableSet.UintSet internal directWithdrawalTokenIndices;

	bool public isMigrationCompleted;

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initializes the Withdrawal contract
	 * @dev Sets up the initial state with required contract references and token indices
	 * @param _admin Address that will be granted ownership of the contract
	 * @param _scrollMessenger Address of the L2 ScrollMessenger contract
	 * @param _withdrawalVerifier Address of the PLONK verifier for withdrawal proofs
	 * @param _liquidity Address of the Liquidity contract on L1
	 * @param _rollup Address of the Rollup contract
	 * @param _contribution Address of the Contribution contract
	 * @param _directWithdrawalTokenIndices Initial list of token indices for direct withdrawals
	 */
	function initialize(
		address _admin,
		address _scrollMessenger,
		address _withdrawalVerifier,
		address _liquidity,
		address _rollup,
		address _contribution,
		uint256[] memory _directWithdrawalTokenIndices
	) external initializer {
		if (
			_admin == address(0) ||
			_scrollMessenger == address(0) ||
			_withdrawalVerifier == address(0) ||
			_liquidity == address(0) ||
			_rollup == address(0) ||
			_contribution == address(0)
		) {
			revert AddressZero();
		}
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
		l2ScrollMessenger = IL2ScrollMessenger(_scrollMessenger);
		withdrawalVerifier = IPlonkVerifier(_withdrawalVerifier);
		rollup = IRollup(_rollup);
		contribution = IContribution(_contribution);
		liquidity = _liquidity;
		innerAddDirectWithdrawalTokenIndices(_directWithdrawalTokenIndices);
	}

	/**
	 * @notice Updates the withdrawal verifier address
	 * @dev Only the contract owner can update the verifier
	 * @param _withdrawalVerifier Address of the new withdrawal verifier
	 */
	function updateVerifier(address _withdrawalVerifier) external onlyOwner {
		if (_withdrawalVerifier == address(0)) {
			revert AddressZero();
		}
		withdrawalVerifier = IPlonkVerifier(_withdrawalVerifier);
		emit VerifierUpdated(_withdrawalVerifier);
	}

	function submitWithdrawalProof(
		ChainedWithdrawalLib.ChainedWithdrawal[] calldata withdrawals,
		WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs
			calldata publicInputs,
		bytes calldata proof
	) external {
		_validateWithdrawalProof(withdrawals, publicInputs, proof);
		uint256 directWithdrawalCounter = 0;
		uint256 claimableWithdrawalCounter = 0;
		bool[] memory isSkippedFlags = new bool[](withdrawals.length);
		for (uint256 i = 0; i < withdrawals.length; i++) {
			ChainedWithdrawalLib.ChainedWithdrawal
				memory chainedWithdrawal = withdrawals[i];
			if (nullifiers[chainedWithdrawal.nullifier]) {
				isSkippedFlags[i] = true;
				continue; // already withdrawn
			}
			nullifiers[chainedWithdrawal.nullifier] = true;
			bytes32 expectedBlockHash = rollup.getBlockHash(
				chainedWithdrawal.blockNumber
			);
			if (expectedBlockHash != chainedWithdrawal.blockHash) {
				revert BlockHashNotExists(chainedWithdrawal.blockHash);
			}
			if (_isDirectWithdrawalToken(chainedWithdrawal.tokenIndex)) {
				directWithdrawalCounter++;
			} else {
				claimableWithdrawalCounter++;
			}
		}
		if (directWithdrawalCounter == 0 && claimableWithdrawalCounter == 0) {
			return;
		}
		if (
			directWithdrawalCounter + claimableWithdrawalCounter > RELAY_LIMIT
		) {
			revert RelayLimitExceeded();
		}
		WithdrawalLib.Withdrawal[]
			memory directWithdrawals = new WithdrawalLib.Withdrawal[](
				directWithdrawalCounter
			);
		bytes32[] memory claimableWithdrawals = new bytes32[](
			claimableWithdrawalCounter
		);

		uint256 directWithdrawalIndex = 0;
		uint256 claimableWithdrawalIndex = 0;

		for (uint256 i = 0; i < withdrawals.length; i++) {
			if (isSkippedFlags[i]) {
				continue; // skipped withdrawal
			}
			ChainedWithdrawalLib.ChainedWithdrawal
				memory chainedWithdrawal = withdrawals[i];
			WithdrawalLib.Withdrawal memory withdrawal = WithdrawalLib
				.Withdrawal(
					chainedWithdrawal.recipient,
					chainedWithdrawal.tokenIndex,
					chainedWithdrawal.amount,
					chainedWithdrawal.nullifier
				);
			if (_isDirectWithdrawalToken(chainedWithdrawal.tokenIndex)) {
				directWithdrawals[directWithdrawalIndex] = withdrawal;
				emit DirectWithdrawalQueued(
					withdrawal.getHash(),
					withdrawal.recipient,
					withdrawal
				);
				directWithdrawalIndex++;
			} else {
				bytes32 withdrawalHash = withdrawal.getHash();
				claimableWithdrawals[claimableWithdrawalIndex] = withdrawalHash;
				emit ClaimableWithdrawalQueued(
					withdrawalHash,
					withdrawal.recipient,
					withdrawal
				);
				claimableWithdrawalIndex++;
			}
		}

		bytes memory message = abi.encodeWithSelector(
			ILiquidity.processWithdrawals.selector,
			directWithdrawals,
			claimableWithdrawals
		);
		_relayMessage(message);

		contribution.recordContribution(
			keccak256("WITHDRAWAL"),
			_msgSender(),
			directWithdrawalCounter + claimableWithdrawalCounter
		);
	}

	/**
	 * @notice Relays a message to the Liquidity contract on L1
	 * @dev Uses the ScrollMessenger to send a cross-chain message
	 * @param message The encoded message to send to the Liquidity contract
	 */
	function _relayMessage(bytes memory message) private {
		uint256 value = 0; // relay to non-payable function
		// In the current implementation of ScrollMessenger, the `gasLimit` is simply included in the L2 event log
		// and does not impose any restrictions on the L1 gas limit. However, considering the possibility of
		// future implementation changes, we will specify a maximum value.
		uint256 gasLimit = type(uint256).max;
		l2ScrollMessenger.sendMessage{value: value}(
			liquidity,
			value,
			message,
			gasLimit,
			_msgSender()
		);
	}

	/**
	 * @notice Checks if a token can be withdrawn directly
	 * @dev Returns true if the token index is in the directWithdrawalTokenIndices set
	 * @param tokenIndex The index of the token to check
	 * @return bool True if the token can be withdrawn directly, false otherwise
	 */
	function _isDirectWithdrawalToken(
		uint32 tokenIndex
	) private view returns (bool) {
		return directWithdrawalTokenIndices.contains(tokenIndex);
	}

	/**
	 * @notice Validates a withdrawal proof
	 * @dev Verifies the withdrawal chain, aggregator, and ZK proof
	 * @param withdrawals Array of chained withdrawals to validate
	 * @param publicInputs Public inputs for the withdrawal proof
	 * @param proof The zero-knowledge proof data
	 */
	function _validateWithdrawalProof(
		ChainedWithdrawalLib.ChainedWithdrawal[] calldata withdrawals,
		WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs
			calldata publicInputs,
		bytes calldata proof
	) private view {
		if (
			!withdrawals.verifyWithdrawalChain(publicInputs.lastWithdrawalHash)
		) {
			revert WithdrawalChainVerificationFailed();
		}
		if (publicInputs.withdrawalAggregator != _msgSender()) {
			revert WithdrawalAggregatorMismatch();
		}
		if (!withdrawalVerifier.Verify(proof, publicInputs.getHash().split())) {
			revert WithdrawalProofVerificationFailed();
		}
	}

	function getDirectWithdrawalTokenIndices()
		external
		view
		returns (uint256[] memory)
	{
		return directWithdrawalTokenIndices.values();
	}

	function addDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external onlyOwner {
		innerAddDirectWithdrawalTokenIndices(tokenIndices);
	}

	/**
	 * @notice Internal function to add token indices to the direct withdrawal set
	 * @dev Adds each token index to the set and emits an event
	 * @param tokenIndices Array of token indices to add
	 */
	function innerAddDirectWithdrawalTokenIndices(
		uint256[] memory tokenIndices
	) private {
		for (uint256 i = 0; i < tokenIndices.length; i++) {
			bool result = directWithdrawalTokenIndices.add(tokenIndices[i]);
			if (!result) {
				revert TokenAlreadyExist(tokenIndices[i]);
			}
		}
		emit DirectWithdrawalTokenIndicesAdded(tokenIndices);
	}

	function removeDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external onlyOwner {
		for (uint256 i = 0; i < tokenIndices.length; i++) {
			bool result = directWithdrawalTokenIndices.remove(tokenIndices[i]);
			if (!result) {
				revert TokenNotExist(tokenIndices[i]);
			}
		}
		emit DirectWithdrawalTokenIndicesRemoved(tokenIndices);
	}

	function migrateWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external onlyOwner {
		if (isMigrationCompleted) {
			revert AlreadyMigrated();
		}
		for (uint256 i = 0; i < withdrawals.length; i++) {
			WithdrawalLib.Withdrawal memory withdrawal = withdrawals[i];
			if (nullifiers[withdrawal.nullifier]) {
				continue; // already withdrawn
			}
			nullifiers[withdrawal.nullifier] = true;
			if (_isDirectWithdrawalToken(withdrawal.tokenIndex)) {
				emit DirectWithdrawalQueued(
					withdrawal.getHash(),
					withdrawal.recipient,
					withdrawal
				);
			} else {
				bytes32 withdrawalHash = withdrawal.getHash();
				emit ClaimableWithdrawalQueued(
					withdrawalHash,
					withdrawal.recipient,
					withdrawal
				);
			}
		}
	}

	function finishMigration() external onlyOwner {
		if (isMigrationCompleted) {
			revert AlreadyMigrated();
		}
		isMigrationCompleted = true;
		emit MigrationCompleted();
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
