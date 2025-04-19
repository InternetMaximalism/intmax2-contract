// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IPermitter} from "./IPermitter.sol";
import {PredicateClient} from "@predicate/contracts/src/mixins/PredicateClient.sol";
import {PredicateMessage} from "@predicate/contracts/src/interfaces/IPredicateClient.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title PredicatePermitter
 * @notice Implementation of IPermitter that uses Predicate Protocol for permission validation
 * @dev Leverages Predicate Protocol's policy-based authorization system to validate user permissions
 */
contract PredicatePermitter is
	PredicateClient,
	UUPSUpgradeable,
	OwnableUpgradeable,
	IPermitter
{
	/**
	 * @notice Error thrown when an address parameter is the zero address
	 * @dev Used in initialize function to validate admin and predicateManager addresses
	 */
	error AddressZero();

	/**
	 * @notice Error thrown when the policy ID string is empty
	 * @dev Used in initialize function to validate the policyID parameter
	 */
	error PolicyIDEmpty();

	/**
	 * @notice Error thrown when the caller is not the liquidity contract
	 * @dev Used in permit function to restrict access to the liquidity contract
	 */
	error NotLiquidity();

	/**
	 * @notice Emitted when the Predicate policy ID is set or updated
	 * @dev Triggered in initialize and setPolicy functions
	 * @param policyID The new policy ID that was set
	 */
	event PolicySet(string policyID);

	/**
	 * @notice Emitted when the Predicate manager address is set or updated
	 * @dev Triggered in initialize and setPredicateManager functions
	 * @param predicateManager The new Predicate manager address
	 */
	event PredicateManagerSet(address predicateManager);

	/**
	 * @notice Address of the liquidity contract
	 * @dev Used to restrict access to certain functions
	 */
	address public liquidity;

	/**
	 * @notice Modifier to restrict access to the liquidity contract
	 * @dev Ensures that only the liquidity contract can call the function
	 */
	modifier onlyLiquidity() {
		if (msg.sender != liquidity) {
			revert NotLiquidity();
		}
		_;
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initializes the PredicatePermitter contract
	 * @dev Sets up the initial state with admin, Predicate manager, and policy ID
	 * @param _admin Address that will be granted ownership of the contract
	 * @param _liquidity Address of the liquidity contract that will interact with this contract
	 * @param _predicateManager Address of the Predicate Protocol manager contract
	 * @param policyID The policy ID string used for permission validation
	 */
	function initialize(
		address _admin,
		address _liquidity,
		address _predicateManager,
		string calldata policyID
	) external initializer {
		if (
			_admin == address(0) ||
			_liquidity == address(0) ||
			_predicateManager == address(0)
		) {
			revert AddressZero();
		}
		if (bytes(policyID).length == 0) {
			revert PolicyIDEmpty();
		}
		liquidity = _liquidity;
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
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
	) external onlyLiquidity returns (bool) {
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

	/**
	 * @notice Authorizes an upgrade to a new implementation
	 * @dev Can only be called by the contract owner
	 * @param newImplementation Address of the new implementation contract
	 */
	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyOwner {}
}
