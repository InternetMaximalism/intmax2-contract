// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IPermitter {
	/// @notice Validate user have right to execute action specified by
	/// @param user The address of user
	/// @param encodedData The encoded data of action that user want to
	/// @param permission The permission of
	function permit(
		address user,
		bytes calldata encodedData,
		bytes calldata permission
	) external;
}
