// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {UD60x18, ud} from "@prb/math/src/UD60x18.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract Contribution is UUPSUpgradeable, AccessControlUpgradeable {
	bytes32 public constant WEIGHT_DECIDER = keccak256("WEIGHT_DECIDER");
	bytes32 public constant CONTRIBUTOR = keccak256("CONTRIBUTOR");

	function initialize() public initializer {
		__UUPSUpgradeable_init();
		__AccessControl_init();
	}

	// period to tag to total contributions
	mapping(uint256 => mapping(bytes32 => uint256))
		public totalContributionsInPeriod;

	// period to tag to user contributions
	mapping(uint256 => mapping(bytes32 => mapping(address => uint256)))
		public userContributionsInPeriod;

	mapping(uint256 => mapping(bytes32 => uint256))
		public contributionWeightOfPeriod;

	bytes32[] allTags;

	function registerContributionWeight(
		uint256 periodNumber,
		bytes32[] memory tags,
		uint256[] memory weights
	) external onlyRole(WEIGHT_DECIDER) {
		require(tags.length == weights.length, "Invalid input length");
		for (uint256 i = 0; i < tags.length; i++) {
			contributionWeightOfPeriod[periodNumber][tags[i]] = weights[i];
		}
	}

	function submitContribution(
		uint256 periodNumber,
		bytes32 tag,
		address user,
		uint256 amount
	) external onlyRole(CONTRIBUTOR) {
		totalContributionsInPeriod[periodNumber][tag] += amount;
		userContributionsInPeriod[periodNumber][tag][user] += amount;
	}

	function getUserContributionRatePerTag(
		uint256 periodNumber,
		bytes32 tag,
		address contributor
	) public view returns (uint256) {
		UD60x18 totalContribution = UD60x18.convert(
			totalContributionsInPeriod[periodNumber][tag]
		);
		uint256 userContribution = userContributionsInPeriod[periodNumber][tag][
			contributor
		];
		return 0;
	}

	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
