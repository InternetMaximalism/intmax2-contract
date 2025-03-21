// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract PermitterTest {
	bool public permitResult = true;

	function setPermitResult(bool result) external {
		permitResult = result;
	}

	// The original perform function is not a view function,
	// but the compiler gives it a view in order to issue a warning.
	function permit(
		address,
		uint256,
		bytes calldata,
		bytes calldata
	) external view returns (bool authorized) {
		return permitResult;
	}
}
