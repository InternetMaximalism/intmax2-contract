// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title IRollup
 * @notice Interface for the Intmax2 L2 rollup contract
 * @dev Defines the external functions, events, and errors for the Rollup contract
 */
interface IRollup {
	/**
	 * @notice Error thrown when a required address parameter is the zero address
	 * @dev Used in initialize function to validate address parameters
	 */
	error AddressZero();

	/**
	 * @notice Error thrown when a non-ScrollMessenger calls a function restricted to ScrollMessenger
	 * @dev Used to enforce cross-chain message security
	 */
	error OnlyScrollMessenger();

	/**
	 * @notice Error thrown when the xDomainMessageSender in ScrollMessenger is not the liquidity contract
	 * @dev Used to ensure only the authorized Liquidity contract can send cross-chain messages
	 */
	error OnlyLiquidity();

	/**
	 * @notice Error thrown when the number of public keys exceeds 128
	 * @dev Used to limit the size of registration blocks
	 */
	error TooManySenderPublicKeys();

	/**
	 * @notice Error thrown when the number of account IDs exceeds 128
	 * @dev Used to limit the size of non-registration blocks
	 */
	error TooManyAccountIds();

	/**
	 * @notice Error thrown when the length of account IDs bytes is not a multiple of 5
	 * @dev Each account ID must be exactly 5 bytes
	 */
	error SenderAccountIdsInvalidLength();

	/**
	 * @notice Error thrown when the posted block fails the pairing test
	 * @dev Indicates an invalid signature or incorrect message point
	 */
	error PairingCheckFailed();

	/**
	 * @notice Error thrown when the specified block number is greater than the latest block number
	 * @dev Used in getBlockHash to prevent accessing non-existent blocks
	 */
	error BlockNumberOutOfRange();

	/**
	 * @notice Error thrown when the fee for the rate limiter is insufficient
	 * @dev The msg.value must cover the penalty calculated by the rate limiter
	 */
	error InsufficientPenaltyFee();

	/**
	 * @notice Error thrown when the expiry timestamp is in the past
	 * @dev Block expiry timestamps must be in the future or zero (no expiry)
	 */
	error Expired();

	/**
	 * @notice Error thrown when the given nonce is less than the current nonce
	 * @dev Nonces must be monotonically increasing to prevent replay attacks
	 */
	error InvalidNonce();

	/**
	 * @notice Event emitted when deposits bridged from the liquidity contract are processed
	 * @dev Triggered when the processDeposits function is called by the Liquidity contract
	 * @param lastProcessedDepositId The ID of the last processed deposit
	 * @param depositTreeRoot The new root of the deposit tree after processing
	 */
	event DepositsProcessed(
		uint256 indexed lastProcessedDepositId,
		bytes32 depositTreeRoot
	);

	/**
	 * @notice Event emitted when a deposit is inserted into the deposit tree
	 * @dev Emitted for each deposit processed in the processDeposits function
	 * @param depositIndex The index of the deposit in the deposit tree
	 * @param depositHash The hash of the deposit data
	 */
	event DepositLeafInserted(
		uint32 indexed depositIndex,
		bytes32 indexed depositHash
	);

	/**
	 * @notice Event emitted when a new block is posted to the rollup chain
	 * @dev Contains all essential information about the newly posted block
	 * @param prevBlockHash The hash of the previous block in the chain
	 * @param blockBuilder The address of the block builder who submitted the block
	 * @param timestamp The timestamp when the block was posted
	 * @param blockNumber The sequential number of the posted block
	 * @param depositTreeRoot The root of the deposit tree at the time of block posting
	 * @param signatureHash The hash of the block signature data
	 */
	event BlockPosted(
		bytes32 indexed prevBlockHash,
		address indexed blockBuilder,
		uint64 timestamp,
		uint256 blockNumber,
		bytes32 depositTreeRoot,
		bytes32 signatureHash
	);

	/**
	 * @notice Emitted when the contract is migrated to a new version
	 */
	event Migrated();

	/**
	 * @notice Struct to store block data to avoid stack too deep errors
	 * @dev Used in the internal _postBlock function to organize block parameters
	 * @param isRegistrationBlock Whether the block is a registration block (true) or non-registration block (false)
	 * @param txTreeRoot The root of the transaction Merkle tree
	 * @param expiry The expiry timestamp of the tx tree root (0 means no expiry)
	 * @param builderAddress The address of the block builder who submitted the block
	 * @param builderNonce The nonce of the block builder (for replay protection)
	 * @param senderFlags Flags indicating whether senders' signatures are included in the aggregated signature
	 */
	struct BlockPostData {
		bool isRegistrationBlock;
		bytes32 txTreeRoot;
		uint64 expiry;
		address builderAddress;
		uint32 builderNonce;
		bytes16 senderFlags;
	}

	/**
	 * @notice Posts a registration block for senders' first transactions
	 * @dev Registration blocks include the public keys of new senders
	 * @param txTreeRoot The root of the transaction Merkle tree
	 * @param expiry The expiry timestamp of the tx tree root (0 means no expiry)
	 * @param builderNonce The registration block nonce of the block builder
	 * @param senderFlags Flags indicating which senders' signatures are included
	 * @param aggregatedPublicKey The aggregated public key for signature verification
	 * @param aggregatedSignature The aggregated signature of all participating senders
	 * @param messagePoint The hash of the tx tree root mapped to G2 curve point
	 * @param senderPublicKeys Array of public keys for new senders (max 128)
	 */
	function postRegistrationBlock(
		bytes32 txTreeRoot,
		uint64 expiry,
		uint32 builderNonce,
		bytes16 senderFlags,
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint,
		uint256[] calldata senderPublicKeys
	) external payable;

	/**
	 * @notice Posts a non-registration block for senders' subsequent transactions
	 * @dev Non-registration blocks use account IDs instead of full public keys
	 * @param txTreeRoot The root of the transaction Merkle tree
	 * @param expiry The expiry timestamp of the tx tree root (0 means no expiry)
	 * @param builderNonce The non-registration block nonce of the block builder
	 * @param senderFlags Flags indicating which senders' signatures are included
	 * @param aggregatedPublicKey The aggregated public key for signature verification
	 * @param aggregatedSignature The aggregated signature of all participating senders
	 * @param messagePoint The hash of the tx tree root mapped to G2 curve point
	 * @param publicKeysHash The hash of the public keys used in this block
	 * @param senderAccountIds Byte array of account IDs (5 bytes per account)
	 */
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
	) external payable;

	/**
	 * @notice Sets the rate limiter constants for the rollup chain
	 * @dev Can only be called by the contract owner
	 * @param thresholdInterval The threshold block submission interval in seconds
	 * @param alpha The alpha value for the exponential moving average
	 * @param k The penalty coefficient for the rate limiter
	 */
	function setRateLimitConstants(
		uint256 thresholdInterval,
		uint256 alpha,
		uint256 k
	) external;

	/**
	 * @notice Withdraws accumulated penalty fees from the Rollup contract
	 * @dev Only the contract owner can call this function
	 * @param to The address to which the penalty fees will be transferred
	 */
	function withdrawPenaltyFee(address to) external;

	/**
	 * @notice Processes deposits from the Liquidity contract
	 * @dev Can only be called by the Liquidity contract via Scroll Messenger
	 * @param lastProcessedDepositId The ID of the last processed deposit
	 * @param depositHashes Array of hashes for the deposits to be processed
	 */
	function processDeposits(
		uint256 lastProcessedDepositId,
		bytes32[] calldata depositHashes
	) external;

	/**
	 * @notice Gets the block number of the latest posted block
	 * @dev Returns the highest block number in the rollup chain
	 * @return The latest block number (zero-based)
	 */
	function getLatestBlockNumber() external view returns (uint32);

	/**
	 * @notice Gets the current penalty fee required by the rate limiter
	 * @dev Calculated based on the exponential moving average of block intervals
	 * @return The penalty fee in wei required for the next block submission
	 */
	function getPenalty() external view returns (uint256);

	/**
	 * @notice Gets the block hash for a specific block number
	 * @dev Reverts if the block number is out of range
	 * @param blockNumber The block number to query
	 * @return The hash of the specified block
	 */
	function getBlockHash(uint32 blockNumber) external view returns (bytes32);
}
