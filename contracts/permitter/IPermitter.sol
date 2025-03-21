// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IPermitter {
	/// @notice Validates if a user has the right to execute a specified action
	/// @param user The address of the user attempting the action
	/// @param value The msg.value of the transaction
	/// @param encodedData The encoded data of the action that user wants to execute
	/// @param permission The permission data that proves user authorization
	/// @return authorized Returns true if the user is authorized, false otherwise
	function permit(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external returns (bool authorized);
}
