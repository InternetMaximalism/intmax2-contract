// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SD59x18, convert, sd, sd59x18} from "@prb/math/src/SD59x18.sol";

/// @title RateLimiterLib
/// @notice A library for implementing a rate limiting mechanism with exponential moving average (EMA)
library RateLimiterLib {
	/// @notice Struct to store the state of the rate limiter
	struct RateLimitState {
		uint256 lastCallTime; // Timestamp of the last call
		SD59x18 emaInterval; // Exponential moving average of intervals between calls
	}

	// Constants (using fixed-point representation)
	int256 public constant TARGET_INTERVAL = 15e18; // Target interval between calls. 15 seconds in fixed-point.
	int256 public constant ALPHA = 0.33e18; // EMA smoothing factor (0.33 in fixed-point)
	int256 public constant K = 0.001e18; // Scaling factor for the penalty calculation

	/// @notice Updates the rate limit state and calculates penalty
	/// @param state The current state of the rate limiter
	/// @return uint256 The calculated penalty
	function update(RateLimitState storage state) internal returns (uint256) {
		uint256 currentTime = block.timestamp;

		SD59x18 targetInterval = sd(TARGET_INTERVAL);
		if (state.lastCallTime == 0) {
			// First call, initialize lastCallTime and emaInterval
			state.lastCallTime = currentTime;
			state.emaInterval = targetInterval; // Initialize EMA to target interval
			return 0;
		}

		// Update the EMA of intervals
		// Formula: emaInterval = alpha * interval + (1 - alpha) * emaInterval
		SD59x18 alpha = sd(ALPHA);
		SD59x18 interval = convert(int256(currentTime - state.lastCallTime));

		state.emaInterval = alpha.mul(interval).add(
			(convert(1).sub(alpha)).mul(state.emaInterval)
		);
		state.lastCallTime = currentTime;

		// Check if the EMA is less than the target interval
		if (state.emaInterval < targetInterval) {
			// Calculate the deviation: D = targetInterval - EMA
			SD59x18 deviation = targetInterval.sub(state.emaInterval);

			// Calculate the penalty: P = k * D^2
			int256 penalty = sd(K).mul(deviation).mul(deviation).unwrap();
			return uint256(penalty);
		} else {
			return 0; // No penalty if EMA is greater than or equal to target interval
		}
	}
}
