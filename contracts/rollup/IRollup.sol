// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title IRollup
/// @notice Interface for the Rollup contract
interface IRollup {
	/// @notice Error thrown when a non-ScrollMessenger calls a function restricted to ScrollMessenger
	error OnlyScrollMessenger();

	/// @notice Error thrown when the xDomainMessageSender in ScrollMessenger is not the liquidity contract
	error OnlyLiquidity();

	/// @notice Error thrown when the number of public keys exceeds 128
	error TooManySenderPublicKeys();

	/// @notice Error thrown when the number of account IDs exceeds 128
	error TooManyAccountIds();

	/// @notice Error thrown when the length of account IDs bytes is not a multiple of 5
	error SenderAccountIdsInvalidLength();

	/// @notice Error thrown when the posted block fails the pairing test
	error PairingCheckFailed();

	/// @notice Error thrown when the specified block number is greater than the latest block number
	error BlockNumberOutOfRange();

	/// @notice Error thrown when the fee for the rate limiter is insufficient
	error InsufficientPenaltyFee();

	/// @notice Event emitted when deposits bridged from the liquidity contract are processed
	/// @param lastProcessedDepositId The ID of the last processed deposit
	/// @param depositTreeRoot The root of the deposit tree after processing
	event DepositsProcessed(
		uint256 indexed lastProcessedDepositId,
		bytes32 depositTreeRoot
	);

	/// @notice Event emitted when a new block is posted
	/// @param prevBlockHash The hash of the previous block
	/// @param blockBuilder The address of the block builder
	/// @param blockNumber The number of the posted block
	/// @param depositTreeRoot The root of the deposit tree
	/// @param signatureHash The hash of the signature
	event BlockPosted(
		bytes32 indexed prevBlockHash,
		address indexed blockBuilder,
		uint256 blockNumber,
		bytes32 depositTreeRoot,
		bytes32 signatureHash
	);

	/// @notice Event emitted to ensure data availability of posted public keys
	/// @param blockNumber The block number associated with the public keys
	/// @param senderPublicKeys The array of sender public keys
	event PubKeysPosted(
		uint256 indexed blockNumber,
		uint256[] senderPublicKeys
	);

	/// @notice Event emitted to ensure data availability of posted account IDs
	/// @param blockNumber The block number associated with the account IDs
	/// @param accountIds The byte sequence of account IDs
	event AccountIdsPosted(uint256 indexed blockNumber, bytes accountIds);

	/// @notice Posts a registration block (for all senders' first transactions, specified by public keys)
	/// @dev msg.value must be greater than or equal to the penalty fee of the rate limiter
	/// @param txTreeRoot The root of the transaction tree
	/// @param senderFlags Flags indicating whether senders' signatures are included in the aggregated signature
	/// @param aggregatedPublicKey The aggregated public key
	/// @param aggregatedSignature The aggregated signature
	/// @param messagePoint The hash of the tx tree root to G2
	/// @param senderPublicKeys The public keys of the senders
	function postRegistrationBlock(
		bytes32 txTreeRoot,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		uint256[] calldata senderPublicKeys
	) external payable;

	/// @notice Posts a non-registration block (for all senders' subsequent transactions, specified by account IDs)
	/// @dev msg.value must be greater than or equal to the penalty fee of the rate limiter
	/// @param txTreeRoot The root of the transaction tree
	/// @param senderFlags Sender flags
	/// @param aggregatedPublicKey The aggregated public key
	/// @param aggregatedSignature The aggregated signature
	/// @param messagePoint The hash of the tx tree root to G2
	/// @param publicKeysHash The hash of the public keys
	/// @param senderAccountIds The account IDs arranged in a byte sequence
	function postNonRegistrationBlock(
		bytes32 txTreeRoot,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		bytes32 publicKeysHash,
		bytes calldata senderAccountIds
	) external payable;

	/// @notice Withdraws the penalty fee from the Rollup contract
	/// @param to The address to which the penalty fee is transferred
	/// @dev Only the owner can call this function
	function withdrawPenaltyFee(address to) external;

	/// @notice Update the deposit tree branch and root
	/// @dev Only Liquidity contract can call this function via Scroll Messenger
	/// @param lastProcessedDepositId The ID of the last processed deposit
	/// @param depositHashes The hashes of the deposits
	function processDeposits(
		uint256 lastProcessedDepositId,
		bytes32[] calldata depositHashes
	) external;

	/// @notice Get the block number of the latest posted block
	/// @return The latest block number
	function getLatestBlockNumber() external view returns (uint32);

	/// @notice Get the block builder for a specific block number
	/// @param blockNumber The block number to query
	/// @return The address of the block builder
	function getBlockBuilder(
		uint32 blockNumber
	) external view returns (address);

	/// @notice Get the block hash for a specific block number
	/// @param blockNumber The block number to query
	/// @return The hash of the specified block
	function getBlockHash(uint32 blockNumber) external view returns (bytes32);
}
