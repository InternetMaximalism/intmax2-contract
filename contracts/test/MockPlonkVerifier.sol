// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IPlonkVerifier} from "../common/IPlonkVerifier.sol";

contract MockPlonkVerifier is IPlonkVerifier {
	bool private result = true;

	function setResult(bool _result) external {
		result = _result;
	}

	/**
	 * @dev This is a mock implementation of the PlonkVerifier contract.
	 */
	// solhint-disable-next-line func-name-mixedcase
	function Verify(
		bytes calldata,
		uint256[] calldata
	) external view returns (bool success) {
		return result;
	}
}
