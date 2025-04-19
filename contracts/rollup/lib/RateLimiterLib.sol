// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {UD60x18, ud, convert} from "@prb/math/src/UD60x18.sol";

/**
 * @title RateLimiterLib
 * @notice A library for implementing a rate limiting mechanism with exponential moving average (EMA)
 * @dev Uses fixed-point arithmetic to calculate penalties for rapid block submissions
 */
library RateLimiterLib {
	/**
	 * @notice Error thrown when trying to set the rate limiter constants to invalid values
	 */
	error InvalidConstants();

	/**
	 * @notice Constants for the rate limiter
	 * @dev thresholdInterval Threshold interval between calls (fixed-point)
	 * @dev alpha Smoothing factor for EMA (fixed-point)
	 * @dev k Scaling factor for the penalty calculation
	 */
	event RateLimitConstantsSet(
		uint256 thresholdInterval,
		uint256 alpha,
		uint256 k
	);

	/**
	 * @notice Struct to store the state of the rate limiter
	 * @dev Holds constants and variables for the rate limiting mechanism
	 * @param thresholdInterval Threshold interval between calls (fixed-point)
	 * @param alpha Smoothing factor for EMA (fixed-point)
	 * @param k Scaling factor for the penalty calculation (fixed-point)
	 * @param lastCallTime Timestamp of the last call to the rate limiter
	 * @param emaInterval Exponential moving average of intervals between calls
	 */
	struct RateLimitState {
		UD60x18 thresholdInterval;
		UD60x18 alpha;
		UD60x18 k;
		uint256 lastCallTime; // Timestamp of the last call
		UD60x18 emaInterval; // Exponential moving average of intervals between calls
	}

	/**
	 * @notice Sets the constants for the rate limiter
	 * @dev Initializes the threshold interval, smoothing factor, and penalty scaling factor
	 * @param state The current state of the rate limiter
	 * @param thresholdInterval Threshold interval between calls (fixed-point)
	 * @param alpha Smoothing factor for EMA (fixed-point)
	 * @param k Scaling factor for the penalty calculation
	 */
	function setConstants(
		RateLimitState storage state,
		uint256 thresholdInterval,
		uint256 alpha,
		uint256 k
	) internal {
		uint256 one = convert(1).unwrap();
		if (alpha >= one) {
			revert InvalidConstants();
		}
		state.thresholdInterval = ud(thresholdInterval);
		state.alpha = ud(alpha);
		state.k = ud(k);
		emit RateLimitConstantsSet(thresholdInterval, alpha, k);
	}

	/**
	 * @notice Helper function that computes the new EMA interval and penalty
	 * @dev Calculates the new EMA based on the current interval and previous EMA
	 * @param state The current state of the rate limiter
	 * @return newEmaInterval The computed new exponential moving average interval
	 * @return penalty The computed penalty fee in wei
	 */
	function _computeNewState(
		RateLimitState storage state
	) private view returns (UD60x18 newEmaInterval, uint256 penalty) {
		UD60x18 thresholdInterval = state.thresholdInterval;

		// If this is the first call, we would initialize emaInterval to thresholdInterval.
		if (state.lastCallTime == 0) {
			return (thresholdInterval, 0);
		}

		UD60x18 alpha = state.alpha;
		UD60x18 interval = convert(block.timestamp - state.lastCallTime);

		// Calculate the new EMA interval:
		// newEmaInterval = alpha * interval + (1 - alpha) * state.emaInterval
		newEmaInterval =
			alpha *
			interval +
			(convert(1) - alpha) *
			state.emaInterval;

		// If the new EMA is less than the threshold, compute the penalty.
		if (newEmaInterval < thresholdInterval) {
			UD60x18 deviation = thresholdInterval - newEmaInterval;
			penalty = (state.k * deviation * deviation).unwrap();
		} else {
			penalty = 0;
		}
	}

	/**
	 * @notice Updates the rate limiter state and calculates the penalty
	 * @dev Updates lastCallTime and emaInterval, then returns the penalty
	 * @param state The current state of the rate limiter
	 * @return The calculated penalty fee in wei
	 */
	function update(RateLimitState storage state) internal returns (uint256) {
		(UD60x18 newEmaInterval, uint256 penalty) = _computeNewState(state);

		// Update the state with the new values.
		state.lastCallTime = block.timestamp;
		state.emaInterval = newEmaInterval;
		return penalty;
	}

	/**
	 * @notice Computes the penalty that would be applied by update, without changing state
	 * @dev Useful for checking the penalty before actually updating the state
	 * @param state The current state of the rate limiter
	 * @return The calculated penalty fee in wei
	 */
	function getPenalty(
		RateLimitState storage state
	) internal view returns (uint256) {
		// We simply compute what the penalty would be.
		(, uint256 penalty) = _computeNewState(state);
		return penalty;
	}
}
