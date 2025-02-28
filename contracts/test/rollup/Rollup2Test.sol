// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {Rollup} from "../../rollup/Rollup.sol";

contract Rollup2Test is Rollup {
	function getVal() external pure returns (uint256) {
		return 2;
	}
}
