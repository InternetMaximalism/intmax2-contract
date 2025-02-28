// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library DepositLimit {
	// Token indices
	uint8 internal constant ETH_INDEX = 0;
	uint8 internal constant WBTC_INDEX = 2;
	uint8 internal constant USDC_INDEX = 3;

	// Time periods in days
	uint16 internal constant PERIOD_1 = 182; // 0.5y
	uint16 internal constant PERIOD_2 = 364; // 1y
	uint16 internal constant PERIOD_3 = 546; // 1.5y
	uint16 internal constant PERIOD_4 = 728; // 2y

	// ETH limits
	uint256 internal constant ETH_LIMIT_0 = 100 ether; // 0-6m
	uint256 internal constant ETH_LIMIT_1 = 500 ether; // 6m-1y
	uint256 internal constant ETH_LIMIT_2 = 1000 ether; // 1y-1.5y
	uint256 internal constant ETH_LIMIT_3 = 5000 ether; // 1.5y-2y
	uint256 internal constant ETH_LIMIT_4 = 10000 ether; // 2y-

	// WBTC limits (in satoshi)
	uint256 internal constant WBTC_LIMIT_0 = 500000000; // 0.5 BTC
	uint256 internal constant WBTC_LIMIT_1 = 1000000000; // 1 BTC
	uint256 internal constant WBTC_LIMIT_2 = 5000000000; // 5 BTC
	uint256 internal constant WBTC_LIMIT_3 = 10000000000; // 10 BTC
	uint256 internal constant WBTC_LIMIT_4 = 50000000000; // 50 BTC

	// USDC limits
	uint256 internal constant USDC_LIMIT_0 = 500000000000; // 500k USDC
	uint256 internal constant USDC_LIMIT_1 = 1000000000000; // 1M USDC
	uint256 internal constant USDC_LIMIT_2 = 5000000000000; // 5M USDC
	uint256 internal constant USDC_LIMIT_3 = 10000000000000; // 10M USDC
	uint256 internal constant USDC_LIMIT_4 = 50000000000000; // 50M USDC

	/// @notice Returns the deposit limit for a token at a given deployment time
	/// @param tokenIndex The index of the token
	/// @param deploymentTime The timestamp of the deployment
	/// @return limit The deposit limit for the token
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
