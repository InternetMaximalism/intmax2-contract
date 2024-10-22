// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library ERC20CallOptionalLib {
	/**
	 * @dev Referring to _callOptionalReturnBool of SafeERC20.sol
	 * @param token The token targeted by the call.
	 * @param data The call data (encoded using abi.encode or one of its variants).
	 */
	function callOptionalReturnBool(
		IERC20 token,
		bytes memory data
	) internal returns (bool) {
		// If the token transfer call succeeded, and the token contract exists,
		// and the return data is empty, or decoded as true then the call succeeded.
		// solhint-disable-next-line avoid-low-level-calls
		(bool success, bytes memory returndata) = address(token).call(data);
		return
			success &&
			(returndata.length == 0 || abi.decode(returndata, (bool))) &&
			address(token).code.length > 0;
	}
}
