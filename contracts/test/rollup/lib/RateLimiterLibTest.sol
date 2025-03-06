// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {RateLimiterLib} from "../../../rollup/lib/RateLimiterLib.sol";

contract RateLimiterLibTest {
	using RateLimiterLib for RateLimiterLib.RateLimitState;

	RateLimiterLib.RateLimitState public state;

	event UpdateResult(uint256 penalty);

	function update() external {
		emit UpdateResult(state.update());
	}

	function getPenalty() external view returns (uint256) {
		return state.getPenalty();
	}
}
