// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title Deposit Queue Library
 * @notice A library for managing a queue of pending deposits in the Liquidity contract
 * @dev Implements a queue data structure with enqueue, dequeue, and delete operations
 * to track deposits that are waiting to be relayed to Layer 2
 */
library DepositQueueLib {
	/**
	 * @notice Error thrown when trying to relay deposits outside the valid queue range
	 * @param upToDepositId The requested deposit ID that is out of range
	 * @param firstDepositId The first valid deposit ID in the queue
	 * @param lastDepositId The last valid deposit ID in the queue
	 */
	error OutOfRange(
		uint256 upToDepositId,
		uint256 firstDepositId,
		uint256 lastDepositId
	);

	/**
	 * @notice Represents a queue of pending deposits
	 * @param depositData Array of deposits that are pending relay to Layer 2
	 * @param front Index of the first element in the queue (the next deposit to be relayed)
	 */
	struct DepositQueue {
		DepositData[] depositData;
		uint256 front;
	}

	/**
	 * @notice Represents data for a single deposit
	 * @dev Stores minimal information needed to track and validate deposits
	 * @param depositHash The hash of the deposit data (includes recipient, amount, token, etc.)
	 * @param sender The address of the depositor (used for cancellation authorization)
	 */
	struct DepositData {
		bytes32 depositHash;
		address sender;
	}

	/**
	 * @notice Initializes the deposit queue
	 * @dev Pushes a dummy element to make the queue 1-indexed for easier tracking
	 * @param depositQueue The storage reference to the DepositQueue struct to initialize
	 */
	function initialize(DepositQueue storage depositQueue) internal {
		depositQueue.depositData.push(DepositData(0, address(0)));
		depositQueue.front = 1;
	}

	/**
	 * @notice Adds a new deposit to the queue
	 * @dev The deposit ID is the index in the depositData array
	 * @param depositQueue The storage reference to the DepositQueue struct
	 * @param depositHash The hash of the deposit data
	 * @param sender The address of the depositor
	 * @return depositId The ID of the newly added deposit (used for tracking and cancellation)
	 */
	function enqueue(
		DepositQueue storage depositQueue,
		bytes32 depositHash,
		address sender
	) internal returns (uint256 depositId) {
		depositId = depositQueue.depositData.length;
		depositQueue.depositData.push(DepositData(depositHash, sender));
	}

	/**
	 * @notice Deletes a deposit from the queue (used for cancellation)
	 * @dev Doesn't actually remove the element from the array, just clears its data
	 * @param depositQueue The storage reference to the DepositQueue struct
	 * @param depositId The ID of the deposit to be deleted
	 * @return depositData The data of the deleted deposit (returned for event emission)
	 */
	function deleteDeposit(
		DepositQueue storage depositQueue,
		uint256 depositId
	) internal returns (DepositData memory depositData) {
		depositData = depositQueue.depositData[depositId];
		delete depositQueue.depositData[depositId];
	}

	/**
	 * @notice Processes deposits in the queue for relay to Layer 2
	 * @dev Collects valid deposit hashes from front to upToDepositId and advances the queue
	 * @dev Skips deposits that have been deleted (sender address is zero)
	 * @param depositQueue The storage reference to the DepositQueue struct
	 * @param upToDepositId The upper bound deposit ID to process
	 * @return An array of deposit hashes to be relayed to Layer 2
	 */
	function batchDequeue(
		DepositQueue storage depositQueue,
		uint256 upToDepositId
	) internal returns (bytes32[] memory) {
		uint256 front = depositQueue.front;
		if (
			upToDepositId >= depositQueue.depositData.length ||
			upToDepositId < front
		) {
			revert OutOfRange(
				upToDepositId,
				front,
				depositQueue.depositData.length - 1
			);
		}
		uint256 counter = 0;
		for (uint256 i = front; i <= upToDepositId; i++) {
			if (depositQueue.depositData[i].sender == address(0)) {
				continue;
			}
			counter++;
		}
		bytes32[] memory depositHashes = new bytes32[](counter);
		uint256 depositHashesIndex = 0;
		for (uint256 i = front; i <= upToDepositId; i++) {
			if (depositQueue.depositData[i].sender == address(0)) {
				continue;
			}
			depositHashes[depositHashesIndex] = depositQueue
				.depositData[i]
				.depositHash;
			depositHashesIndex++;
		}
		depositQueue.front = upToDepositId + 1;
		return depositHashes;
	}
}
