// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20CallOptionalLib} from "../../../liquidity/lib/ERC20CallOptionalLib.sol";

contract ERC20CallOptionalLibTest {
	using ERC20CallOptionalLib for IERC20;
	bool public result;

	function callOptionalReturnBool(
		address token,
		address recipient,
		uint256 amount
	) external {
		bytes memory transferCall = abi.encodeWithSelector(
			IERC20(token).transfer.selector,
			recipient,
			amount
		);
		// solhint-disable-next-line reentrancy
		result = IERC20(token).callOptionalReturnBool(transferCall);
	}
}
