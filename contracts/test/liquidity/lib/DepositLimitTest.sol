// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {DepositLimit} from "../../../liquidity/lib/DepositLimit.sol";

contract DepositLimitTest {
	function getDepositLimit(
		uint32 tokenIndex,
		uint256 deploymentTime
	) external view returns (uint256) {
		return DepositLimit.getDepositLimit(tokenIndex, deploymentTime);
	}
}
