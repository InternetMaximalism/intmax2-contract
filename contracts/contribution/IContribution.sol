// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {UD60x18} from "@prb/math/src/UD60x18.sol";

interface IContribution {
	/// @notice Error thrown when the input lengths of tags and weights do not match in registerWeights function
	/// @dev This error is raised to ensure data integrity when registering weights for tags
	error InvalidInputLength();

	/// @notice Get the list of tags registered for a specific period.
	/// @param periodNumber The number of the period to query.
	/// @return An array of bytes32 representing the tags.
	function getTags(
		uint256 periodNumber
	) external view returns (bytes32[] memory);

	/// @notice Get the weights array for a specified period.
	/// @param periodNumber The number of the period to query.
	/// @return An array of uint256 representing the weights.
	function getWeights(
		uint256 periodNumber
	) external view returns (uint256[] memory);

	/// @notice Register tags and their corresponding weights for a period.
	/// @param periodNumber The number of the period to register for.
	/// @param tags An array of bytes32 representing the tags.
	/// @param weights An array of uint256 representing the weights corresponding to the tags.
	function registerWeights(
		uint256 periodNumber,
		bytes32[] memory tags,
		uint256[] memory weights
	) external;

	/// @notice Record a contribution for a specific tag and user.
	/// @param tag The tag associated with the contribution.
	/// @param user The address of the user making the contribution.
	/// @param amount The amount of contribution to record.
	function recordContribution(
		bytes32 tag,
		address user,
		uint256 amount
	) external;

	/// @notice Get the contribution rate of a specific user for a given period.
	/// @param periodNumber The number of the period to query.
	/// @param user The address of the user to check.
	/// @return The contribution rate as a UD60x18 value, representing the user's share of the total contribution.
	function getContributionRate(
		uint256 periodNumber,
		address user
	) external view returns (UD60x18);
}
