// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title IContribution
 * @notice Interface for the Contribution contract that tracks user contributions across different periods
 * @dev This interface defines the methods and events for recording and querying contributions
 */
interface IContribution {
	/**
	 * @notice Error thrown when attempting to initialize with a zero period interval
	 * @dev This error is used to prevent invalid period configurations
	 */
	error periodIntervalZero();

	/**
	 * @notice Emitted when a contribution is recorded
	 * @param periodNumber The number of the period when the contribution was recorded
	 * @param tag The tag associated with the contribution (used for categorization)
	 * @param user The address of the user making the contribution
	 * @param amount The amount of the contribution
	 */
	event ContributionRecorded(
		uint256 indexed periodNumber,
		bytes32 indexed tag,
		address indexed user,
		uint256 amount
	);

	/**
	 * @notice Gets the current period number based on the current timestamp
	 * @dev Calculated as (current_timestamp - start_timestamp) / period_interval
	 * @return The current period number
	 */
	function getCurrentPeriod() external view returns (uint256);

	/**
	 * @notice Records a contribution for a specific tag and user
	 * @dev Can only be called by addresses with the CONTRIBUTOR role
	 * @param tag The tag associated with the contribution (used for categorization)
	 * @param user The address of the user making the contribution
	 * @param amount The amount of contribution to record
	 */
	function recordContribution(
		bytes32 tag,
		address user,
		uint256 amount
	) external;

	/**
	 * @notice Returns the total contribution for a specific tag in the specified period
	 * @dev Aggregates all user contributions for the given tag and period
	 * @param period The period number for which the contribution is being queried
	 * @param tag The tag (as bytes32) for which the contribution is being queried
	 * @return The total contribution amount for the specified period and tag
	 */
	function totalContributions(
		uint256 period,
		bytes32 tag
	) external view returns (uint256);

	/**
	 * @notice Returns the contribution of a specific user for a tag in the specified period
	 * @dev Retrieves individual user contribution data
	 * @param period The period number for which the contribution is being queried
	 * @param tag The tag (as bytes32) for which the contribution is being queried
	 * @param user The address of the user whose contribution is being queried
	 * @return The contribution amount for the specified user, period, and tag
	 */
	function userContributions(
		uint256 period,
		bytes32 tag,
		address user
	) external view returns (uint256);
}
