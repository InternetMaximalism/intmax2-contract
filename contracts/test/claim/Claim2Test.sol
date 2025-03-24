// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;
import {Claim} from "../../claim/Claim.sol";

contract Claim2Test is Claim {
	function getVal() external pure returns (uint256) {
		return 88;
	}
}
