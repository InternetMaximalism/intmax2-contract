// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ERC20 Call Optional Library
 * @notice A library for safely handling ERC20 token transfers that may not conform to the ERC20 standard
 * @dev Some ERC20 tokens don't revert on failure or don't return a boolean value as specified in the standard.
 * This library handles these non-standard implementations safely.
 */
library ERC20CallOptionalLib {
	/**
	 * @notice Makes a low-level call to an ERC20 token contract and safely handles various return value scenarios
	 * @dev Inspired by OpenZeppelin's SafeERC20 _callOptionalReturnBool function
	 * @dev Handles three cases:
	 *  1. Token returns true/false as per ERC20 spec
	 *  2. Token returns nothing (empty return data)
	 *  3. Token doesn't revert but returns non-boolean data
	 * @param token The ERC20 token contract to call
	 * @param data The call data (typically a transfer or transferFrom function call)
	 * @return bool True if the call was successful, false otherwise
	 */
	function callOptionalReturnBool(
		IERC20 token,
		bytes memory data
	) internal returns (bool) {
		// solhint-disable-next-line avoid-low-level-calls
		(bool success, bytes memory returndata) = address(token).call(data);
		return
			success &&
			(returndata.length == 0 || abi.decode(returndata, (bool))) &&
			address(token).code.length > 0;
	}
}
