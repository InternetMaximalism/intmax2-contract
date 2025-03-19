// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IPermitter {
	/// @notice Validate user have right to execute action specified by
	/// @param user The address of user
	/// @param value The msg.value of transaction
	/// @param encodedData The encoded data of action that user want to
	/// @param permission The permission of
	function permit(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external returns (bool);
}
