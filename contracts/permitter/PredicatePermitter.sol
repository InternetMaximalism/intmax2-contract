// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IPermitter} from "./IPermitter.sol";
import {PredicateClient} from "@predicate/contracts/src/mixins/PredicateClient.sol";
import {PredicateMessage} from "@predicate/contracts/src/interfaces/IPredicateClient.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PredicatePermitter is
	PredicateClient,
	UUPSUpgradeable,
	OwnableUpgradeable,
	IPermitter
{
	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize(
		address _admin,
		address _predicateManager,
		string calldata policyID
	) external initializer {
		if (_admin == address(0) || _predicateManager == address(0)) {
			revert AddressZero();
		}
		if (bytes(policyID).length == 0) {
			revert PolicyIDEmpty();
		}
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
		_initPredicateClient(_predicateManager, policyID);
		emit PolicySet(policyID);
		emit PredicateManagerSet(_predicateManager);
	}

	function permit(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external returns (bool) {
		PredicateMessage memory predicateMessage = abi.decode(
			permission,
			(PredicateMessage)
		);
		return
			_authorizeTransaction(predicateMessage, encodedData, user, value);
	}

	/// @notice Set the policy ID of Predicate
	/// @dev Only the owner can call this function
	/// @param policyID The policy ID to set
	function setPolicy(string calldata policyID) external onlyOwner {
		_setPolicy(policyID);
		emit PolicySet(policyID);
	}

	/// @notice Set the Predicate Manager
	/// @dev Only the owner can call this function
	/// @param serviceManager The Predicate Manager address to set
	function setPredicateManager(address serviceManager) external onlyOwner {
		_setPredicateManager(serviceManager);
		emit PredicateManagerSet(serviceManager);
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
