// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IContribution} from "./IContribution.sol";

/**
 * @title Contribution
 * @notice Contract for tracking user contributions across different time periods
 */
contract Contribution is
	IContribution,
	UUPSUpgradeable,
	AccessControlUpgradeable
{
	/**
	 * @notice Role identifier for contracts that can record contributions
	 * @dev Addresses with this role can call the recordContribution function
	 */
	bytes32 public constant CONTRIBUTOR = keccak256("CONTRIBUTOR");

	/**
	 * @notice Start timestamp of the contribution period tracking
	 * @dev Used as the reference point for calculating period numbers
	 */
	uint256 public startTimestamp;

	/**
	 * @notice Duration of each contribution period in seconds
	 * @dev Used to calculate the current period number
	 */
	uint256 public periodInterval;

	/**
	 * @notice Maps periods and tags to total contributions
	 * @dev Mapping structure: period => tag => total contribution amount
	 */
	mapping(uint256 => mapping(bytes32 => uint256)) public totalContributions;

	/**
	 * @notice Maps periods, tags, and users to their individual contributions
	 * @dev Mapping structure: period => tag => user address => contribution amount
	 */
	mapping(uint256 => mapping(bytes32 => mapping(address => uint256)))
		public userContributions;

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initializes the contract with an admin and period interval
	 * @dev Sets up the initial state of the contract and aligns the start timestamp
	 * @param admin Address that will be granted the DEFAULT_ADMIN_ROLE
	 * @param _periodInterval Duration of each period in seconds (must be non-zero)
	 */
	function initialize(
		address admin,
		uint256 _periodInterval
	) external initializer {
		if (_periodInterval == 0) {
			revert periodIntervalZero();
		}
		__UUPSUpgradeable_init();
		__AccessControl_init();
		_grantRole(DEFAULT_ADMIN_ROLE, admin);
		if (_periodInterval > 1 days) {
			// align the start timestamp to the start of the day
			startTimestamp = (block.timestamp / 1 days) * 1 days;
		} else {
			// align the start timestamp to the start of the period
			startTimestamp =
				(block.timestamp / _periodInterval) *
				_periodInterval;
		}
		periodInterval = _periodInterval;
	}

	/**
	 * @notice Calculates the current period number based on the current timestamp
	 * @dev Calculated as (current_timestamp - startTimestamp) / periodInterval
	 * @return The current period number
	 */
	function getCurrentPeriod() public view returns (uint256) {
		return (block.timestamp - startTimestamp) / periodInterval;
	}

	/**
	 * @notice Records a contribution for a specific tag and user
	 * @dev Updates both total and user-specific contribution amounts for the current period
	 * @param tag The tag associated with the contribution (used for categorization)
	 * @param user The address of the user making the contribution
	 * @param amount The amount of contribution to record
	 */
	function recordContribution(
		bytes32 tag,
		address user,
		uint256 amount
	) external onlyRole(CONTRIBUTOR) {
		uint256 currentPeriodCached = getCurrentPeriod();
		totalContributions[currentPeriodCached][tag] += amount;
		userContributions[currentPeriodCached][tag][user] += amount;
		emit ContributionRecorded(currentPeriodCached, tag, user, amount);
	}

	/**
	 * @notice Authorizes an upgrade to a new implementation
	 * @dev Can only be called by an account with the DEFAULT_ADMIN_ROLE
	 * @param newImplementation Address of the new implementation contract
	 */
	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
