// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IBlockBuilderRegistry} from "./IBlockBuilderRegistry.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title Block Builder Registry
 * @notice Registry for block builders to signal their availability in the Intmax2 protocol
 * @dev Implements the IBlockBuilderRegistry interface with upgradeable and ownership functionality
 */
contract BlockBuilderRegistry is
	OwnableUpgradeable,
	UUPSUpgradeable,
	IBlockBuilderRegistry
{
	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initializes the contract with an admin address
	 * @dev Sets up the initial owner and initializes the upgradeable functionality
	 * @param admin The address that will have admin/owner privileges
	 */
	function initialize(address admin) external initializer {
		__Ownable_init(admin);
		__UUPSUpgradeable_init();
	}

	/**
	 * @notice Allows a block builder to emit a heartbeat signaling they are online
	 * @dev Emits a BlockBuilderHeartbeat event with the sender's address and provided URL
	 * @param url The URL endpoint where the block builder can be reached
	 */
	function emitHeartbeat(string calldata url) external {
		emit BlockBuilderHeartbeat(_msgSender(), url);
	}

	/**
	 * @notice Authorizes an upgrade to the implementation
	 * @dev Only callable by the owner
	 * @param newImplementation The address of the new implementation (unused but required by UUPS pattern)
	 */
	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyOwner {}
}
