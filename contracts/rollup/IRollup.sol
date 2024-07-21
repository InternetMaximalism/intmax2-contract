// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRollup {
	error OnlyScrollMessenger();

	error OnlyLiquidity();

	error SenderPublicKeysEmpty();

	error TooManySenderPublicKeys();

	error SenderAccountIdsEmpty();

	error TooManyAccountIds();

	error SenderAccountIdsInvalidLength();

	error BlockHashAlreadyPosted();

	error PairingCheckFailed();

	error BlockNumberOutOfRange();

	error SenderFlagsIsZero();

	error InvalidBlockBuilder();

	event DepositsProcessed(
		uint256 indexed lastProcessedDepositId,
		bytes32 depositTreeRoot
	);

	event BlockPosted(
		bytes32 indexed prevBlockHash,
		address indexed blockBuilder,
		uint256 blockNumber,
		bytes32 depositTreeRoot,
		bytes32 signatureHash
	);

	/// @notice Emits posted public keys as an event. This is necessary for generating validity proofs.
	/// @param blockNumber The block number of the posted public keys.
	/// @param senderPublicKeys An array of sender public keys posted in the block.
	event PubKeysPosted(
		uint256 indexed blockNumber,
		uint256[] senderPublicKeys
	);

	/// @notice Emits posted account IDs as an event. This is necessary for generating validity proofs.
	/// @param blockNumber The block number of the posted account IDs.
	/// @param accountIds A byte array containing the account IDs posted in the block.
	event AccountIdsPosted(uint256 indexed blockNumber, bytes accountIds);

	/*****************************
	 * Public Mutating Functions *
	 *****************************/

	/// @notice Posts a block containing only first-time transaction senders in INTMAX.
	/// @dev First-time senders are automatically assigned an account ID within the ZKP constraints.
	/// @param txTreeRoot The root hash of the Merkle Tree of transactions.
	/// @param senderFlags A 128-bit flag indicating whether each sender returned a signature. Stored in big-endian. If all bits are 0, reverts.
	/// @param aggregatedPublicKey The weighted aggregate of the senders' public keys.
	/// @param aggregatedSignature The aggregate of the senders' signatures.
	/// @param messagePoint The message point calculated from txTreeRoot.
	/// @param senderPublicKeys An array of senders' public keys. Must contain at least 1 and at most 128 elements.
	function postRegistrationBlock(
		bytes32 txTreeRoot,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		uint256[] calldata senderPublicKeys
	) external;

	/// @notice Posts a block containing only senders who have previously sent transactions in INTMAX.
	/// @param txTreeRoot The root hash of the Merkle Tree of transactions.
	/// @param senderFlags A 128-bit flag indicating whether each sender returned a signature. Stored in big-endian. If all bits are 0, reverts.
	/// @param aggregatedPublicKey The weighted aggregate of the senders' public keys.
	/// @param aggregatedSignature The aggregate of the senders' signatures.
	/// @param messagePoint The message point calculated from txTreeRoot.
	/// @param publicKeysHash The hash of senders' public keys padded to 128.
	/// @param senderAccountIds An array of sender account IDs. Each account ID is represented by 5 bytes. The length is minimum 5 bytes and maximum 640 bytes.
	function postNonRegistrationBlock(
		bytes32 txTreeRoot,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		bytes32 publicKeysHash,
		bytes calldata senderAccountIds
	) external;

	/*************************
	 * Public View Functions *
	 *************************/

	/// @notice Returns the address of the Block Builder who posted the block specified by `blockNumber`.
	/// @dev Reverts if the block does not exist.
	/// @param blockNumber The number of the block to query.
	/// @return The address of the Block Builder for the specified block.
	function getBlockBuilder(
		uint32 blockNumber
	) external view returns (address);

	/// @notice Returns the hash of the block specified by `blockNumber`.
	/// @dev Reverts if the block does not exist.
	/// @param blockNumber The number of the block to query.
	/// @return The hash of the specified block.
	function getBlockHash(uint32 blockNumber) external view returns (bytes32);

	/*****************************
	 * Public System Functions *
	 *****************************/

	/// @notice Adds `depositHashes` to the deposit tree. This function is called from the L1 liquidity contract via the L2 ScrollMessenger.
	/// @dev Processes deposits up to and including the specified deposit ID.
	/// @param upToDepositId The ID of the last deposit to be processed by this function call.
	/// @param depositHashes An array of deposit hashes to be added to the deposit tree.
	function processDeposits(
		uint256 upToDepositId,
		bytes32[] calldata depositHashes
	) external;
}
