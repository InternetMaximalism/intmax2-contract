// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title Deposit Limit Library
 * @notice A library for managing deposit limits for different tokens over time
 * @dev Implements a time-based deposit limit system that increases limits for specific tokens
 * as time passes from the deployment date
 */
library DepositLimit {
	/**
	 * @notice Token index constants for supported tokens
	 * @dev These indices must match the indices used in the TokenData contract
	 */
	uint8 internal constant ETH_INDEX = 0;
	uint8 internal constant WBTC_INDEX = 2;
	uint8 internal constant USDC_INDEX = 3;

	/**
	 * @notice Time period constants in days from deployment
	 * @dev Used to determine which deposit limit applies based on elapsed time
	 */
	uint16 internal constant PERIOD_1 = 182; // 0.5 years (6 months)
	uint16 internal constant PERIOD_2 = 364; // 1 year
	uint16 internal constant PERIOD_3 = 546; // 1.5 years (18 months)
	uint16 internal constant PERIOD_4 = 728; // 2 years

	/**
	 * @notice ETH deposit limits for different time periods
	 * @dev Values in wei (1 ether = 10^18 wei)
	 */
	uint256 internal constant ETH_LIMIT_0 = 100 ether; // Initial to 6 months: 100 ETH
	uint256 internal constant ETH_LIMIT_1 = 500 ether; // 6 months to 1 year: 500 ETH
	uint256 internal constant ETH_LIMIT_2 = 1000 ether; // 1 year to 1.5 years: 1,000 ETH
	uint256 internal constant ETH_LIMIT_3 = 5000 ether; // 1.5 years to 2 years: 5,000 ETH
	uint256 internal constant ETH_LIMIT_4 = 10000 ether; // After 2 years: 10,000 ETH

	/**
	 * @notice WBTC deposit limits for different time periods
	 * @dev Values in satoshi (1 BTC = 10^8 satoshi)
	 */
	uint256 internal constant WBTC_LIMIT_0 = 500000000; // Initial to 6 months: 5 BTC
	uint256 internal constant WBTC_LIMIT_1 = 1000000000; // 6 months to 1 year: 10 BTC
	uint256 internal constant WBTC_LIMIT_2 = 5000000000; // 1 year to 1.5 years: 50 BTC
	uint256 internal constant WBTC_LIMIT_3 = 10000000000; // 1.5 years to 2 years: 100 BTC
	uint256 internal constant WBTC_LIMIT_4 = 50000000000; // After 2 years: 500 BTC

	/**
	 * @notice USDC deposit limits for different time periods
	 * @dev Values in USDC atomic units (1 USDC = 10^6 units)
	 */
	uint256 internal constant USDC_LIMIT_0 = 500000000000; // Initial to 6 months: 500,000 USDC
	uint256 internal constant USDC_LIMIT_1 = 1000000000000; // 6 months to 1 year: 1,000,000 USDC
	uint256 internal constant USDC_LIMIT_2 = 5000000000000; // 1 year to 1.5 years: 5,000,000 USDC
	uint256 internal constant USDC_LIMIT_3 = 10000000000000; // 1.5 years to 2 years: 10,000,000 USDC
	uint256 internal constant USDC_LIMIT_4 = 50000000000000; // After 2 years: 50,000,000 USDC

	/**
	 * @notice Returns the current deposit limit for a token based on time elapsed since deployment
	 * @dev For tokens other than ETH, WBTC, and USDC, returns the maximum possible uint256 value
	 * @param tokenIndex The index of the token to get the deposit limit for
	 * @param deploymentTime The timestamp when the contract was deployed (used as the starting point)
	 * @return limit The current deposit limit for the specified token
	 */
	function getDepositLimit(
		uint32 tokenIndex,
		uint256 deploymentTime
	) internal view returns (uint256 limit) {
		if (
			tokenIndex != ETH_INDEX &&
			tokenIndex != WBTC_INDEX &&
			tokenIndex != USDC_INDEX
		) {
			return type(uint256).max;
		}

		if (block.timestamp < deploymentTime) {
			if (tokenIndex == ETH_INDEX) return ETH_LIMIT_0;
			if (tokenIndex == WBTC_INDEX) return WBTC_LIMIT_0;
			return USDC_LIMIT_0;
		}

		uint256 daysElapsed = (block.timestamp - deploymentTime) / 1 days;

		// Determine period index
		uint8 periodIndex;
		if (daysElapsed >= PERIOD_4) periodIndex = 4;
		else if (daysElapsed >= PERIOD_3) periodIndex = 3;
		else if (daysElapsed >= PERIOD_2) periodIndex = 2;
		else if (daysElapsed >= PERIOD_1) periodIndex = 1;
		else periodIndex = 0;

		// Return limit based on token type and period
		if (tokenIndex == ETH_INDEX) {
			if (periodIndex == 0) return ETH_LIMIT_0;
			if (periodIndex == 1) return ETH_LIMIT_1;
			if (periodIndex == 2) return ETH_LIMIT_2;
			if (periodIndex == 3) return ETH_LIMIT_3;
			return ETH_LIMIT_4;
		} else if (tokenIndex == WBTC_INDEX) {
			if (periodIndex == 0) return WBTC_LIMIT_0;
			if (periodIndex == 1) return WBTC_LIMIT_1;
			if (periodIndex == 2) return WBTC_LIMIT_2;
			if (periodIndex == 3) return WBTC_LIMIT_3;
			return WBTC_LIMIT_4;
		} else {
			if (periodIndex == 0) return USDC_LIMIT_0;
			if (periodIndex == 1) return USDC_LIMIT_1;
			if (periodIndex == 2) return USDC_LIMIT_2;
			if (periodIndex == 3) return USDC_LIMIT_3;
			return USDC_LIMIT_4;
		}
	}
}
