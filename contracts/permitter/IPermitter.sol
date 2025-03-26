// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title IPermitter
 * @notice Interface for permission validation contracts that authorize user actions
 * @dev This interface defines the method for validating if a user has permission to execute a specific action
 */
interface IPermitter {
	/**
	 * @notice Validates if a user has the right to execute a specified action
	 * @dev This function is called to check permissions before executing protected operations
	 * @param user The address of the user attempting the action
	 * @param value The msg.value of the transaction being authorized
	 * @param encodedData The encoded function call data of the action that user wants to execute
	 * @param permission The permission data that proves user authorization (format depends on implementation)
	 * @return authorized Returns true if the user is authorized to perform the action, false otherwise
	 */
	function permit(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external returns (bool authorized);
}
