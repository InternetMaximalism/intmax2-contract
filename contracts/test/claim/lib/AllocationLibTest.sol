// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {AllocationLib} from "../../../claim/lib/AllocationLib.sol";

contract AllocationLibTest {
	using AllocationLib for AllocationLib.State;

	AllocationLib.State private state;

	uint256 public userAllocation;

	function setStartTimeStamp() external {
		state.setStartTimeStamp();
	}

	function recordContribution(
		address recipient,
		uint256 depositAmount
	) external {
		state.recordContribution(recipient, depositAmount);
	}

	function consumeUserAllocation(
		uint256 periodNumber,
		address user
	) external {
		userAllocation = state.consumeUserAllocation(periodNumber, user);
	}

	function getUserAllocation(
		uint256 periodNumber,
		address user
	) external view returns (uint256) {
		return state.getUserAllocation(periodNumber, user);
	}

	function getAllocationPerPeriod(
		uint256 periodNumber
	) external view returns (uint256) {
		return state.getAllocationPerPeriod(periodNumber);
	}

	function getCurrentPeriod() external view returns (uint256) {
		return state.getCurrentPeriod();
	}

	function getAllocationInfo(
		uint256 periodNumber,
		address user
	) external view returns (AllocationLib.AllocationInfo memory) {
		return state.getAllocationInfo(periodNumber, user);
	}

	function getAllocationConstants()
		external
		view
		returns (AllocationLib.AllocationConstants memory)
	{
		return state.getAllocationConstants();
	}

	function calculateContribution(
		uint256 amount
	) external pure returns (uint256) {
		return AllocationLib.calculateContribution(amount);
	}

	function getStateStartTimestamp() external view returns (uint256) {
		return state.startTimestamp;
	}
	function getTotalContributions(
		uint256 key
	) external view returns (uint256) {
		return state.totalContributions[key];
	}
	function getUserContributions(
		uint256 key,
		address user
	) external view returns (uint256) {
		return state.userContributions[key][user];
	}
}
