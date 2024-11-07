// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IBlockBuilderRegistry {
	/// @notice address is zero address
	error AddressZero();

	/// @notice Error thrown when trying to register a block builder with an empty URL
	error URLIsEmpty();

	/// @notice Error thrown when the staked amount is insufficient
	error InsufficientStakeAmount();

	/// @notice Error thrown when trying to slash a block builder that is not staking
	error BlockBuilderNotFound();

	/// @notice Error thrown when trying to unstake within the challenge duration
	error CannotUnstakeWithinChallengeDuration();

	/// @notice Error thrown when attempting to slash the same block number twice
	error FraudProofAlreadySubmitted();

	/// @notice Error thrown when fraud proof verification fails
	error FraudProofVerificationFailed();

	/// @notice Error thrown when the block hash in public input doesn't match the contract's record
	/// @param given The block hash provided in the public input
	/// @param expected The block hash expected by the contract
	error FraudProofBlockHashMismatch(bytes32 given, bytes32 expected);

	/// @notice Error thrown when the challenger in public input doesn't match msg.sender
	error FraudProofChallengerMismatch();

	/// @notice Event emitted when a fraud proof is submitted
	/// @param blockNumber The number of the block being challenged
	/// @param blockBuilder The address of the block builder being challenged
	/// @param challenger The address of the challenger submitting the fraud proof
	event BlockFraudProofSubmitted(
		uint32 indexed blockNumber,
		address indexed blockBuilder,
		address indexed challenger
	);

	/// @notice Event emitted when a block builder is updated
	/// @param blockBuilder The address of the updated block builder
	/// @param url The new URL of the block builder
	/// @param stakeAmount The new stake amount of the block builder
	event BlockBuilderUpdated(
		address indexed blockBuilder,
		string url,
		uint256 stakeAmount
	);

	/// @notice Event emitted when a block builder stops operations
	/// @param blockBuilder The address of the block builder that stopped
	event BlockBuilderStopped(address indexed blockBuilder);

	/// @notice Event emitted when a block builder is slashed
	/// @param blockBuilder The address of the slashed block builder
	/// @param challenger The address of the challenger who submitted the fraud proof
	event BlockBuilderSlashed(
		address indexed blockBuilder,
		address indexed challenger
	);

	/**
	 * @notice Block builder information.
	 * @param blockBuilderUrl The URL or IP address of Block builder.
	 * @param stakeAmount The stake amount of Block Builder.
	 * @param stopTime The time when the node declares that it has ceased operations.
	 * @param numSlashes The number of times the node has been slashed so far.
	 * @param isValid A flag whether the node is not malicious.
	 */
	struct BlockBuilderInfo {
		string blockBuilderUrl;
		uint256 stakeAmount;
		uint256 stopTime;
		uint256 numSlashes;
		bool isValid;
	}

	/**
	 * @notice Block builder info with address.
	 * @param blockBuilderAddress The address of the block builder.
	 * @param info The block builder information.
	 */
	struct BlockBuilderInfoWithAddress {
		address blockBuilderAddress;
		BlockBuilderInfo info;
	}

	/**
	 * @notice Update block builder.
	 * @dev This method is used to register or update the URL or IP address of the block builder.
	 * @dev The block builder must send at least 0.1 ETH to this contract to register.
	 * @param url The URL or IP address of Block builder.
	 */
	function updateBlockBuilder(string memory url) external payable;

	/**
	 * @notice Declare that the block builder has stopped.
	 * @dev This method must be run before unstake.
	 */
	function stopBlockBuilder() external;

	/**
	 * @notice Check if the block builder is valid.
	 * @param blockBuilder The address of the block builder.
	 * @return True if the block builder is valid.
	 * @dev The block builder is valid if the stake amount is greater than or equal to 0.1 ETH.
	 */
	function isValidBlockBuilder(
		address blockBuilder
	) external view returns (bool);

	/**
	 * @notice Get the block builder information of valid block builders.
	 * @return The block builder information.
	 */
	function getValidBlockBuilders()
		external
		view
		returns (BlockBuilderInfoWithAddress[] memory);
}
