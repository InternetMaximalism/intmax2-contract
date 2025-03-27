// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title IClaim
 * @notice Interface for the Claim contract that handles claims from intmax2 and distributes rewards
 * @dev Defines the functions and events for claim verification and reward allocation
 */
import {ClaimProofPublicInputsLib} from "./lib/ClaimProofPublicInputsLib.sol";
import {ChainedClaimLib} from "./lib/ChainedClaimLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {AllocationLib} from "./lib/AllocationLib.sol";

interface IClaim {
	/**
	 * @notice address is zero address
	 */
	error AddressZero();

	/**
	 * @notice Error thrown when the verification of the claim proof's public input hash chain fails
	 */
	error ClaimChainVerificationFailed();

	/**
	 * @notice Error thrown when the aggregator in the claim proof's public input doesn't match the actual contract executor
	 */
	error ClaimAggregatorMismatch();

	/**
	 * @notice Error thrown when the block hash in the claim proof's public input doesn't exist
	 * @param blockHash The non-existent block hash
	 */
	error BlockHashNotExists(bytes32 blockHash);

	/**
	 * @notice Error thrown when the ZKP verification of the claim proof fails
	 */
	error ClaimProofVerificationFailed();

	/**
	 * @notice Emitted when a direct withdrawal is queued
	 * @param withdrawalHash The hash of the withdrawal
	 * @param recipient The address of the recipient
	 * @param withdrawal The withdrawal details
	 */
	event DirectWithdrawalQueued(
		bytes32 indexed withdrawalHash,
		address indexed recipient,
		WithdrawalLib.Withdrawal withdrawal
	);

	/**
	 * @notice Submit claim proof from intmax2
	 * @param claims List of chained claims
	 * @param publicInputs Public inputs for the claim proof
	 * @param proof The proof data
	 */
	function submitClaimProof(
		ChainedClaimLib.ChainedClaim[] calldata claims,
		ClaimProofPublicInputsLib.ClaimProofPublicInputs calldata publicInputs,
		bytes calldata proof
	) external;

	/**
	 * @notice relay claims to the liquidity contract as withdrawals
	 */
	function relayClaims(uint256 period, address[] calldata users) external;

	/**
	 * @notice Get the current period number
	 * @return The current period number
	 */
	function getCurrentPeriod() external view returns (uint256);

	/**
	 * @notice Get the allocation info for a user in a period
	 * @param periodNumber The period number
	 * @param user The user address
	 * @return The allocation info
	 */
	function getAllocationInfo(
		uint256 periodNumber,
		address user
	) external view returns (AllocationLib.AllocationInfo memory);

	/**
	 * @notice Get the allocation constants
	 * @return The allocation constants
	 */
	function getAllocationConstants()
		external
		view
		returns (AllocationLib.AllocationConstants memory);
}
