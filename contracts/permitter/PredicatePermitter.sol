// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IPermitter} from "./IPermitter.sol";
import {PredicateClient} from "@predicate/contracts/src/mixins/PredicateClient.sol";
import {PredicateMessage} from "@predicate/contracts/src/interfaces/IPredicateClient.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredicatePermitter
 * @notice Implementation of IPermitter that uses Predicate Protocol for permission validation
 * @dev Non-upgradeable version that leverages Predicate Protocol's policy-based authorization system
 */
contract PredicatePermitter is PredicateClient, Ownable, IPermitter {
	/**
	 * @notice Error thrown when an address parameter is the zero address
	 * @dev Used in constructor to validate admin and predicateManager addresses
	 */
	error AddressZero();

	/**
	 * @notice Error thrown when the policy ID string is empty
	 * @dev Used in constructor to validate the policyID parameter
	 */
	error PolicyIDEmpty();

	/**
	 * @notice Emitted when the Predicate policy ID is set or updated
	 * @dev Triggered in constructor and setPolicy functions
	 * @param policyID The new policy ID that was set
	 */
	event PolicySet(string policyID);

	/**
	 * @notice Emitted when the Predicate manager address is set or updated
	 * @dev Triggered in constructor and setPredicateManager functions
	 * @param predicateManager The new Predicate manager address
	 */
	event PredicateManagerSet(address predicateManager);

	/**
	 * @notice Creates a new PredicatePermitter contract
	 * @dev Sets up the initial state with admin, Predicate manager, and policy ID
	 * @param _admin Address that will be granted ownership of the contract
	 * @param _predicateManager Address of the Predicate Protocol manager contract
	 * @param policyID The policy ID string used for permission validation
	 */
	constructor(
		address _admin,
		address _predicateManager,
		string memory policyID
	) Ownable(_admin) {
		if (_admin == address(0) || _predicateManager == address(0)) {
			revert AddressZero();
		}
		if (bytes(policyID).length == 0) {
			revert PolicyIDEmpty();
		}

		_initPredicateClient(_predicateManager, policyID);
		emit PolicySet(policyID);
		emit PredicateManagerSet(_predicateManager);
	}

	/**
	 * @notice Validates if a user has permission to execute a specified action
	 * @dev Decodes the permission data as a PredicateMessage and uses Predicate Protocol for validation
	 * @param user The address of the user attempting the action
	 * @param value The msg.value of the transaction being authorized
	 * @param encodedData The encoded function call data of the action
	 * @param permission The permission data containing a PredicateMessage
	 * @return Boolean indicating whether the user is authorized
	 */
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
}
