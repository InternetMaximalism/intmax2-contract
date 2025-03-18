// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library AllocationLib {
	// Period interval. 1 hour in testnet, 1 day in mainnet
	uint256 private constant PERIOD_INTERVAL = 1 hours;

	// constants for the token minting curve
	uint256 public constant GENESIS_TIMESTAMP = 1722999120;
	uint256 public constant PHASE0_REWARD_PER_DAY = 8937500 * (10 ** 18);
	uint256 public constant NUM_PHASES = 7;
	uint256 public constant PHASE0_PERIOD = 16;

	/// @notice Emitted when an invalid deposit amount is provided
	error InvalidDepositAmount();

	/// @notice Emitted when an attempt is made to consume allocations for the current period
	error NotFinishedPeriod();

	/// @notice Emitted when a contribution is recorded
	/// @param period current period
	/// @param recipient user address
	/// @param depositAmount deposit amount
	/// @param contribution calculated contribution
	event ContributionRecorded(
		uint256 indexed period,
		address indexed recipient,
		uint256 depositAmount,
		uint256 contribution
	);

	/// @notice Represents the state of the allocation
	/// @param startTimestamp The timestamp of the start of the allocation
	/// @param totalContributions Maps period => total contributions in period
	/// @param userContributions Maps period => user address => user contributions in period
	struct State {
		uint256 startTimestamp;
		mapping(uint256 => uint256) totalContributions;
		mapping(uint256 => mapping(address => uint256)) userContributions;
	}

	/// @notice Represents the constants for the allocation
	/// @param startTimestamp The timestamp of the start of the allocation
	/// @param periodInterval The interval between periods
	/// @param genesisTimestamp The timestamp of the genesis block
	/// @param phase0RewardPerDay The reward per day for phase 0
	/// @param numPhases The number of phases in the minting curve
	/// @param phase0Period The duration of phase 0 in days
	struct AllocationConstants {
		uint256 startTimestamp;
		uint256 periodInterval;
		uint256 genesisTimestamp;
		uint256 phase0RewardPerDay;
		uint256 numPhases;
		uint256 phase0Period;
	}

	/// @notice Represents the information for a user's allocation
	/// @param totalContribution The total contribution in the period
	/// @param allocationPerPeriod The allocation per period
	/// @param userContribution The user's contribution in the period
	/// @param userAllocation The user's allocation in the period
	struct AllocationInfo {
		uint256 totalContribution;
		uint256 allocationPerPeriod;
		uint256 userContribution;
		uint256 userAllocation;
	}

	/// @notice Initializes the allocation state
	/// @param state The allocation state
	function setStartTimeStamp(State storage state) internal {
		state.startTimestamp =
			(block.timestamp / PERIOD_INTERVAL) *
			PERIOD_INTERVAL;
	}

	/// @notice Records a user's contribution
	/// @param state The allocation state
	/// @param recipient The address of the recipient
	/// @param depositAmount The amount of the deposit
	function recordContribution(
		State storage state,
		address recipient,
		uint256 depositAmount
	) internal {
		uint256 period = getCurrentPeriod(state);
		uint256 contribution = calculateContribution(depositAmount);
		state.totalContributions[period] += contribution;
		state.userContributions[period][recipient] += contribution;
		emit ContributionRecorded(
			period,
			recipient,
			depositAmount,
			contribution
		);
	}

	/// @notice Gets the user's allocation for a period
	/// @param state The allocation state
	/// @param periodNumber The period number
	/// @param user The user's address
	/// @return The user's allocation
	function getUserAllocation(
		State storage state,
		uint256 periodNumber,
		address user
	) internal view returns (uint256) {
		if (state.totalContributions[periodNumber] == 0) {
			return 0;
		}
		return
			(getAllocationPerPeriod(state, periodNumber) *
				state.userContributions[periodNumber][user]) /
			state.totalContributions[periodNumber];
	}

	/// @notice Consumes a user's allocation for a period
	/// @param state The allocation state
	/// @param periodNumber The period number
	/// @param user The user's address
	/// @return The user's allocation
	function consumeUserAllocation(
		State storage state,
		uint256 periodNumber,
		address user
	) internal returns (uint256) {
		if (periodNumber >= getCurrentPeriod(state)) {
			revert NotFinishedPeriod();
		}
		uint256 userAllocation = getUserAllocation(state, periodNumber, user);
		state.userContributions[periodNumber][user] = 0;
		return userAllocation;
	}

	/// @notice Gets the allocation per period
	/// @param state The allocation state
	/// @param periodNumber The period number
	/// @return The allocation per period
	function getAllocationPerPeriod(
		State storage state,
		uint256 periodNumber
	) internal view returns (uint256) {
		uint256 rewardPerDay = getAllocationPerDay(
			state.startTimestamp,
			periodNumber
		);
		return (rewardPerDay * PERIOD_INTERVAL) / 1 days;
	}

	/// @notice Gets the allocation per period
	/// @param startTimestamp The start timestamp
	/// @param periodNumber The period number
	/// @return The allocation per period
	function getAllocationPerDay(
		uint256 startTimestamp,
		uint256 periodNumber
	) private pure returns (uint256) {
		uint256 elapsedDays = (startTimestamp +
			periodNumber *
			PERIOD_INTERVAL -
			GENESIS_TIMESTAMP) / 1 days;
		uint256 rewardPerDay = PHASE0_REWARD_PER_DAY;
		unchecked {
			for (uint256 i = 0; i < NUM_PHASES; i++) {
				uint256 phaseDays = PHASE0_PERIOD << i;
				if (elapsedDays < phaseDays) {
					return rewardPerDay;
				}
				elapsedDays -= phaseDays;
				rewardPerDay >>= 1;
			}
		}
		return 0;
	}

	/// @notice Calculates the contribution for a deposit amount
	/// @param amount The deposit amount
	/// @return The calculated contribution
	function calculateContribution(
		uint256 amount
	) internal pure returns (uint256) {
		if (amount == 0.1 ether) {
			return 1;
		} else if (amount == 1 ether) {
			return 4;
		} else if (amount == 10 ether) {
			return 9;
		} else if (amount == 100 ether) {
			return 16;
		} else {
			revert InvalidDepositAmount();
		}
	}

	/// @notice Gets the current period
	/// @param state The allocation state
	/// @return The current period
	function getCurrentPeriod(
		State storage state
	) internal view returns (uint256) {
		return (block.timestamp - state.startTimestamp) / PERIOD_INTERVAL;
	}

	/// @notice Gets the allocation information for a user
	/// @param state The allocation state
	/// @param periodNumber The period number
	/// @param user The user's address
	/// @return The allocation information
	function getAllocationInfo(
		State storage state,
		uint256 periodNumber,
		address user
	) internal view returns (AllocationInfo memory) {
		uint256 totalContribution = state.totalContributions[periodNumber];
		uint256 allocationPerPeriod = getAllocationPerPeriod(
			state,
			periodNumber
		);
		uint256 userContribution = state.userContributions[periodNumber][user];
		uint256 userAllocation = getUserAllocation(state, periodNumber, user);
		return
			AllocationInfo({
				totalContribution: totalContribution,
				allocationPerPeriod: allocationPerPeriod,
				userContribution: userContribution,
				userAllocation: userAllocation
			});
	}

	/// @notice Gets the allocation constants
	/// @param state The allocation state
	/// @return The allocation constants
	function getAllocationConstants(
		State storage state
	) internal view returns (AllocationConstants memory) {
		return
			AllocationConstants({
				startTimestamp: state.startTimestamp,
				periodInterval: PERIOD_INTERVAL,
				genesisTimestamp: GENESIS_TIMESTAMP,
				phase0RewardPerDay: PHASE0_REWARD_PER_DAY,
				numPhases: NUM_PHASES,
				phase0Period: PHASE0_PERIOD
			});
	}
}
