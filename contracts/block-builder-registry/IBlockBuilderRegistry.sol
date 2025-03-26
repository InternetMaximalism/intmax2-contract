// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title Block Builder Registry Interface
 * @notice Interface for registering and tracking block builders in the Intmax2 protocol
 * @dev Block builders emit heartbeats to signal their availability and provide their URL
 */
interface IBlockBuilderRegistry {
	/**
	 * @notice Event emitted when a block builder signals they are online
	 * @dev Used to track active block builders and their endpoints
	 * @param blockBuilder The address of the block builder emitting the heartbeat
	 * @param url The URL endpoint where the block builder can be reached
	 */
	event BlockBuilderHeartbeat(address indexed blockBuilder, string url);

	/**
	 * @notice Allows a block builder to emit a heartbeat signaling they are online
	 * @dev The sender's address is automatically recorded as the block builder address
	 * @param url The URL endpoint where the block builder can be reached
	 */
	function emitHeartbeat(string calldata url) external;
}
