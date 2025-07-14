// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {WithdrawalProofPublicInputsLib} from "./lib/WithdrawalProofPublicInputsLib.sol";
import {ChainedWithdrawalLib} from "./lib/ChainedWithdrawalLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";

/**
 * @title IWithdrawal
 * @notice Interface for the Withdrawal contract that processes withdrawals from L2 to L1
 * @dev Defines the functions, events, and errors for handling withdrawal proofs and token management
 */
interface IWithdrawal {
	/**
	 * @notice Error thrown when a required address parameter is the zero address
	 * @dev Used in initialize function to validate address parameters
	 */
	error AddressZero();

	/**
	 * @notice Error thrown when the verification of the withdrawal proof's public input hash chain fails
	 * @dev Indicates that the chain of withdrawal hashes doesn't match the expected final hash
	 */
	error WithdrawalChainVerificationFailed();

	/**
	 * @notice Error thrown when the aggregator in the withdrawal proof's public input doesn't match the actual contract executor
	 * @dev Ensures that only the designated aggregator can submit the proof
	 */
	error WithdrawalAggregatorMismatch();

	/**
	 * @notice Error thrown when the block hash in the withdrawal proof's public input doesn't exist
	 * @dev Ensures that withdrawals reference valid blocks in the rollup chain
	 * @param blockHash The non-existent block hash that caused the error
	 */
	error BlockHashNotExists(bytes32 blockHash);

	/**
	 * @notice Error thrown when the zero-knowledge proof verification fails
	 * @dev Indicates an invalid or malformed withdrawal proof
	 */
	error WithdrawalProofVerificationFailed();

	/**
	 * @notice Error thrown when attempting to add a token to direct withdrawal tokens that already exists
	 * @dev Prevents duplicate entries in the direct withdrawal token list
	 * @param tokenIndex The index of the token that already exists in the direct withdrawal list
	 */
	error TokenAlreadyExist(uint256 tokenIndex);

	/**
	 * @notice Error thrown when attempting to remove a non-existent token from direct withdrawal tokens
	 * @dev Ensures that only tokens in the direct withdrawal list can be removed
	 * @param tokenIndex The index of the non-existent token in the direct withdrawal list
	 */
	error TokenNotExist(uint256 tokenIndex);

	/**
	 * @notice Error when trying to relay too many claims at once
	 * @dev To prevent transaction failure on L1 due to large gas consumption
	 */
	error RelayLimitExceeded();

	/**
	 * @notice Emitted when new withdrawal verifier is set
	 */
	event VerifierUpdated(address indexed withdrawalVerifier);

	/**
	 * @notice Emitted when the contract is migrated to a new version
	 */
	event Migrated();

	/**
	 * @notice Emitted when a claimable withdrawal is queued
	 * @dev Triggered for withdrawals of tokens not in the direct withdrawal list
	 * @param withdrawalHash The hash of the withdrawal, used as an identifier
	 * @param recipient The L1 address of the recipient
	 * @param withdrawal The complete withdrawal details
	 */
	event ClaimableWithdrawalQueued(
		bytes32 indexed withdrawalHash,
		address indexed recipient,
		WithdrawalLib.Withdrawal withdrawal
	);

	/**
	 * @notice Emitted when a direct withdrawal is queued
	 * @dev Triggered for withdrawals of tokens in the direct withdrawal list
	 * @param withdrawalHash The hash of the withdrawal, used as an identifier
	 * @param recipient The L1 address of the recipient
	 * @param withdrawal The complete withdrawal details
	 */
	event DirectWithdrawalQueued(
		bytes32 indexed withdrawalHash,
		address indexed recipient,
		WithdrawalLib.Withdrawal withdrawal
	);

	/**
	 * @notice Emitted when token indices are added to the direct withdrawal list
	 * @dev Triggered by the addDirectWithdrawalTokenIndices function
	 * @param tokenIndices Array of token indices that were added to the direct withdrawal list
	 */
	event DirectWithdrawalTokenIndicesAdded(uint256[] tokenIndices);

	/**
	 * @notice Emitted when token indices are removed from the direct withdrawal list
	 * @dev Triggered by the removeDirectWithdrawalTokenIndices function
	 * @param tokenIndices Array of token indices that were removed from the direct withdrawal list
	 */
	event DirectWithdrawalTokenIndicesRemoved(uint256[] tokenIndices);

	/**
	 * @notice Submit and verify a withdrawal proof from Intmax2 L2
	 * @dev Processes the withdrawals and relays them to the Liquidity contract on L1
	 * @param withdrawals Array of chained withdrawals to process
	 * @param publicInputs Public inputs for the withdrawal proof verification
	 * @param proof The zero-knowledge proof data
	 */
	function submitWithdrawalProof(
		ChainedWithdrawalLib.ChainedWithdrawal[] calldata withdrawals,
		WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs
			calldata publicInputs,
		bytes calldata proof
	) external;

	/**
	 * @notice Get the list of token indices that can be withdrawn directly
	 * @dev Returns the current set of direct withdrawal token indices
	 * @return An array of token indices that can be withdrawn directly
	 */
	function getDirectWithdrawalTokenIndices()
		external
		view
		returns (uint256[] memory);

	/**
	 * @notice Add token indices to the list of direct withdrawal token indices
	 * @dev Can only be called by the contract owner
	 * @param tokenIndices The token indices to add to the direct withdrawal list
	 * @notice ERC721 and ERC1155 tokens are not supported for direct withdrawal.
	 * When transferred to the liquidity contract, they will be converted to claimable withdrawals.
	 */
	function addDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external;

	/**
	 * @notice Remove token indices from the list of direct withdrawal token indices
	 * @dev Can only be called by the contract owner
	 * @param tokenIndices The token indices to remove from the direct withdrawal list
	 */
	function removeDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external;
}
