// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IBlockBuilderRegistry {
	/// @notice Error thrown when trying to register a block builder with an empty URL
	error URLIsEmpty();

	/// @notice Error thrown when trying to stop a block builder that is not adding
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
	 * @param isActive active flag.
	 */
	struct BlockBuilderInfo {
		string blockBuilderUrl;
		bool isActive;
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
	 * @param url The URL or IP address of Block builder.
	 */
	function updateBlockBuilder(string memory url) external;

	/**
	 * @notice Declare that the block builder has stopped.
	 */
	function stopBlockBuilder() external;

	/**
	 * @notice Check if the block builder is active.
	 * @param blockBuilder The address of the block builder.
	 * @return True if the block builder is active.
	 */
	function isActiveBlockBuilder(
		address blockBuilder
	) external view returns (bool);

	/**
	 * @notice Get the block builder information of active block builders.
	 * @return The block builder information.
	 */
	function getActiveBlockBuilders()
		external
		view
		returns (BlockBuilderInfoWithAddress[] memory);
}
