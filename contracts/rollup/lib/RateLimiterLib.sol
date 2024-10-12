// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {UD60x18, ud, convert} from "@prb/math/src/UD60x18.sol";

/// @title RateLimiterLib
/// @notice A library for implementing a rate limiting mechanism with exponential moving average (EMA)
library RateLimiterLib {
	/// @notice Struct to store the state of the rate limiter
	struct RateLimitState {
		uint256 lastCallTime; // Timestamp of the last call
		UD60x18 emaInterval; // Exponential moving average of intervals between calls
	}

	// Constants (using fixed-point representation)
	uint256 public constant TARGET_INTERVAL = 15e18; // Target interval between calls. 15 seconds in fixed-point.
	uint256 public constant ALPHA = 333_333_333_333_333_333; // Smoothing factor for EMA calculation (2/(5 + 1) = 1/3 in fixed-point)
	uint256 public constant K = 0.001e18; // Scaling factor for the penalty calculation

	/// @notice Updates the rate limit state and calculates penalty
	/// @param state The current state of the rate limiter
	/// @return uint256 The calculated penalty
	function update(RateLimitState storage state) internal returns (uint256) {
		uint256 currentTime = block.timestamp;

		UD60x18 targetInterval = ud(TARGET_INTERVAL);
		if (state.lastCallTime == 0) {
			// First call, initialize lastCallTime and emaInterval
			state.lastCallTime = currentTime;
			state.emaInterval = targetInterval; // Initialize EMA to target interval
			return 0;
		}

		// Update the EMA of intervals
		// Formula: emaInterval = alpha * interval + (1 - alpha) * emaInterval
		UD60x18 alpha = ud(ALPHA);
		UD60x18 interval = convert(currentTime - state.lastCallTime);

		UD60x18 newEmaInterval = alpha *
			interval +
			(convert(1) - alpha) *
			state.emaInterval;
		state.emaInterval = newEmaInterval;
		state.lastCallTime = currentTime;

		// Check if the EMA is less than the target interval
		if (newEmaInterval < targetInterval) {
			// Calculate the deviation: D = targetInterval - EMA
			UD60x18 deviation = targetInterval - newEmaInterval;

			// Calculate the penalty: P = k * D^2
			return (ud(K) * deviation * deviation).unwrap();
		} else {
			return 0; // No penalty if EMA is greater than or equal to target interval
		}
	}
}
