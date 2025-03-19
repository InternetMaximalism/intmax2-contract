// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/// @title Deposit Queue Library
/// @notice A library for managing a queue of pending deposits
library DepositQueueLib {
	/// @notice Represents a queue of pending deposits
	/// @param depositData Array of deposits that are pending
	/// @param front Index of the first element in the queue
	struct DepositQueue {
		DepositData[] depositData;
		uint256 front;
	}

	/// @notice Represents data for a single deposit
	/// @dev Includes deposit hash, sender address, and rejection status
	/// @param depositHash The hash of the deposit
	/// @param sender The address of the depositor
	/// @param isRejected Whether the deposit has been rejected
	struct DepositData {
		bytes32 depositHash;
		address sender;
		bool isRejected;
	}

	/// @notice Initializes the deposit queue
	/// @dev Pushes a dummy element to make the queue 1-indexed
	/// @param depositQueue The storage reference to the DepositQueue struct
	function initialize(DepositQueue storage depositQueue) internal {
		depositQueue.depositData.push(DepositData(0, address(0), false));
		depositQueue.front = 1;
	}

	/// @notice Adds a new deposit to the queue
	/// @param depositQueue The storage reference to the DepositQueue struct
	/// @param depositHash The hash of the deposit
	/// @param sender The address of the depositor
	/// @return depositId The ID of the newly added deposit
	function enqueue(
		DepositQueue storage depositQueue,
		bytes32 depositHash,
		address sender
	) internal returns (uint256 depositId) {
		depositId = depositQueue.depositData.length;
		depositQueue.depositData.push(DepositData(depositHash, sender, false));
	}

	/// @notice Deletes a deposit from the queue
	/// @param depositQueue The storage reference to the DepositQueue struct
	/// @param depositId The ID of the deposit to be deleted
	/// @return depositData The data of the deleted deposit
	function deleteDeposit(
		DepositQueue storage depositQueue,
		uint256 depositId
	) internal returns (DepositData memory depositData) {
		depositData = depositQueue.depositData[depositId];
		delete depositQueue.depositData[depositId];
	}
}
