// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

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
	uint256 public constant TARGET_INTERVAL = 15e18; // Target interval between calls (15 seconds)
	uint256 public constant ALPHA = 333_333_333_333_333_333; // Smoothing factor for EMA (≈ 1/3 in fixed-point)
	uint256 public constant K = 0.001e18; // Scaling factor for the penalty calculation

	/// @notice Helper function that computes the new EMA interval and penalty.
	/// @dev This function does not change state.
	/// @param state The current state of the rate limiter.
	/// @param currentTime The current block timestamp.
	/// @return newEmaInterval The computed new EMA interval.
	/// @return penalty The computed penalty.
	function _computeNewState(
		RateLimitState storage state,
		uint256 currentTime
	) private view returns (UD60x18 newEmaInterval, uint256 penalty) {
		UD60x18 targetInterval = ud(TARGET_INTERVAL);

		// If this is the first call, we would initialize emaInterval to targetInterval.
		if (state.lastCallTime == 0) {
			return (targetInterval, 0);
		}

		UD60x18 alpha = ud(ALPHA);
		UD60x18 interval = convert(currentTime - state.lastCallTime);

		// Calculate the new EMA interval:
		// newEmaInterval = alpha * interval + (1 - alpha) * state.emaInterval
		newEmaInterval =
			alpha *
			interval +
			(convert(1) - alpha) *
			state.emaInterval;

		// If the new EMA is less than the target, compute the penalty.
		if (newEmaInterval < targetInterval) {
			UD60x18 deviation = targetInterval - newEmaInterval;
			penalty = (ud(K) * deviation * deviation).unwrap();
		} else {
			penalty = 0;
		}
	}

	/// @notice Updates the rate limiter state and calculates the penalty.
	/// @param state The current state of the rate limiter.
	/// @return The calculated penalty.
	function update(RateLimitState storage state) internal returns (uint256) {
		uint256 currentTime = block.timestamp;
		(UD60x18 newEmaInterval, uint256 penalty) = _computeNewState(
			state,
			currentTime
		);

		// Update the state with the new values.
		state.lastCallTime = currentTime;
		state.emaInterval = newEmaInterval;
		return penalty;
	}

	/// @notice Computes the penalty that would be applied by update, without changing state.
	/// @param state The current state of the rate limiter.
	/// @return The calculated penalty.
	function getPenalty(
		RateLimitState storage state
	) internal view returns (uint256) {
		// We simply compute what the penalty would be.
		(, uint256 penalty) = _computeNewState(state, block.timestamp);
		return penalty;
	}
}
