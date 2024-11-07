// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IBlockBuilderRegistry {
	/// @notice Error thrown when trying to register a block builder with an empty URL
	error URLIsEmpty();

	/// @notice Error thrown when trying to slash a block builder that is not staking
	error BlockBuilderNotFound();

	/// @notice Event emitted when a block builder is updated
	/// @param blockBuilder The address of the updated block builder
	/// @param url The new URL of the block builder
	event BlockBuilderUpdated(address indexed blockBuilder, string url);

	/// @notice Event emitted when a block builder stops operations
	/// @param blockBuilder The address of the block builder that stopped
	event BlockBuilderStopped(address indexed blockBuilder);

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
	function updateBlockBuilder(string memory url) external;

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
