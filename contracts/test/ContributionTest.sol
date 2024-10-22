// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract ContributionTest {
	bytes32 public latestTag;
	address public latestUser;
	uint256 public latestAmount;
	function recordContribution(
		bytes32 tag,
		address user,
		uint256 amount
	) external {
		latestTag = tag;
		latestUser = user;
		latestAmount = amount;
	}
}
