// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;
import {Contribution} from "../../contribution/Contribution.sol";

contract Contribution2Test is Contribution {
	function getVal() external pure returns (uint256) {
		return 99;
	}
}
