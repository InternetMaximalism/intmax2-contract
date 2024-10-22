// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {Liquidity} from "../../liquidity/Liquidity.sol";

contract Liquidity2Test is Liquidity {
	function getVal() external pure returns (uint256) {
		return 7;
	}
}
