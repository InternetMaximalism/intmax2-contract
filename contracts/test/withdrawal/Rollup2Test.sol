// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Withdrawal} from "../../withdrawal/Withdrawal.sol";

contract Withdrawal2Test is Withdrawal {
	function getVal() external pure returns (uint256) {
		return 3;
	}
}