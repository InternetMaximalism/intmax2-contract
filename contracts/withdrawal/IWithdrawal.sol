// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {WithdrawalProofPublicInputsLib} from "./lib/WithdrawalProofPublicInputsLib.sol";
import {ChainedWithdrawalLib} from "./lib/ChainedWithdrawalLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";

interface IWithdrawal {
	/// @notice address is zero address
	error AddressZero();

	/// @notice Error thrown when the verification of the withdrawal proof's public input hash chain fails
	error WithdrawalChainVerificationFailed();

	/// @notice Error thrown when the aggregator in the withdrawal proof's public input doesn't match the actual contract executor
	error WithdrawalAggregatorMismatch();

	/// @notice Error thrown when the block hash in the withdrawal proof's public input doesn't exist
	/// @param blockHash The non-existent block hash
	error BlockHashNotExists(bytes32 blockHash);

	/// @notice Error thrown when the ZKP verification of the withdrawal proof fails
	error WithdrawalProofVerificationFailed();

	/// @notice Error thrown when attempting to add a token to direct withdrawal tokens that already exists
	/// @param tokenIndice The index of the token that already exists
	error TokenAlreadyExist(uint256 tokenIndice);

	/// @notice Error thrown when attempting to remove a non-existent token from direct withdrawal tokens
	/// @param tokenIndice The index of the non-existent token
	error TokenNotExist(uint256 tokenIndice);

	/// @notice Emitted when a claimable withdrawal is queued
	/// @param claimableWithdrawalId The ID of the claimable withdrawal
	/// @param recipient The address of the recipient
	/// @param withdrawal The withdrawal details
	event ClaimableWithdrawalQueued(
		uint256 indexed claimableWithdrawalId,
		address indexed recipient,
		WithdrawalLib.Withdrawal withdrawal
	);

	/// @notice Emitted when a direct withdrawal is queued
	/// @param directWithdrawalId The ID of the direct withdrawal
	/// @param recipient The address of the recipient
	/// @param withdrawal The withdrawal details
	event DirectWithdrawalQueued(
		uint256 indexed directWithdrawalId,
		address indexed recipient,
		WithdrawalLib.Withdrawal withdrawal
	);

	/// @notice Emitted when withdrawals are queued
	/// @param lastDirectWithdrawalId The ID of the last direct withdrawal
	/// @param lastClaimableWithdrawalId The ID of the last claimable withdrawal
	event WithdrawalsQueued(
		uint256 lastDirectWithdrawalId,
		uint256 lastClaimableWithdrawalId
	);

	/// @notice Emitted when direct withdrawal token indices are added
	/// @param tokenIndices The token indices that were added
	event DirectWithdrawalTokenIndicesAdded(uint256[] tokenIndices);

	/// @notice Emitted when direct withdrawal token indices are removed
	/// @param tokenIndices The token indices that were removed
	event DirectWithdrawalTokenIndicesRemoved(uint256[] tokenIndices);

	/// @notice Submit withdrawal proof from intmax2
	/// @param withdrawals List of chained withdrawals
	/// @param publicInputs Public inputs for the withdrawal proof
	/// @param proof The proof data
	function submitWithdrawalProof(
		ChainedWithdrawalLib.ChainedWithdrawal[] calldata withdrawals,
		WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs
			calldata publicInputs,
		bytes calldata proof
	) external;

	/// @notice Get the token indices for direct withdrawals
	/// @return An array of token indices
	function getDirectWithdrawalTokenIndices()
		external
		view
		returns (uint256[] memory);

	/// @notice Add token indices to the list of direct withdrawal token indices
	/// @param tokenIndices The token indices to add
	/// @notice ERC721 and ERC1155 tokens are not supported for direct withdrawal.
	/// When transferred to the liquidity contract, they will be converted to claimable withdrawals.
	function addDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external;

	/// @notice Remove token indices from the list of direct withdrawal token indices
	/// @param tokenIndices The token indices to remove
	function removeDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external;
}
