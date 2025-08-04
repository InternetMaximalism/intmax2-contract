// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title IMigration
 * @notice Interface for migration functionality in contracts
 * @dev Defines the functions and events for contract migration
 */
interface IMigration {
	/**
	 * @notice Error thrown when an invalid input is provided
	 */
	error InvalidInput();

	/**
	 * @notice Error when trying to migrate already migrated contract
	 */
	error AlreadyMigrated();

	/**
	 * @notice Emitted when the contract is migrated to a new version
	 */
	event MigrationCompleted();
}
