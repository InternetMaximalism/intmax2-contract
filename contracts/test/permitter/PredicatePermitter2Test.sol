// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;
import {PredicatePermitter} from "../../permitter/PredicatePermitter.sol";

contract PredicatePermitter2Test is PredicatePermitter {
	function getVal() external pure returns (uint256) {
		return 77;
	}
}
