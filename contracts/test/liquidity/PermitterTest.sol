// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract PermitterTest {
	address public latestUser;
	uint256 public latestValue;
	bytes public latestEncodedData;
	bytes public latestPermission;

	bool public permitResult = true;

	function setPermitResult(bool result) external {
		permitResult = result;
	}

	function permit(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external returns (bool authorized) {
		latestUser = user;
		latestValue = value;
		latestEncodedData = encodedData;
		latestPermission = permission;
		return permitResult;
	}
}
