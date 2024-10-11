// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title Deposit Queue Library
/// @notice A library for managing a queue of pending deposits
library DepositQueueLib {
	/// @notice Error thrown when trying to analyze deposits outside the queue range
	/// @param upToDepositId The requested deposit ID to analyze up to
	/// @param firstDepositId The first deposit ID in the queue
	/// @param lastDepositId The last deposit ID in the queue
	error TriedAnalyzeOutOfRange(
		uint256 upToDepositId,
		uint256 firstDepositId,
		uint256 lastDepositId
	);

	/// @notice Error thrown when trying to reject a deposit outside the analyzed range
	/// @param rejectIndex The index of the deposit to be rejected
	/// @param front The front index of the queue
	/// @param upToDepositId The upper bound of the analyzed range
	error TriedToRejectOutOfRange(
		uint256 rejectIndex,
		uint256 front,
		uint256 upToDepositId
	);

	/// @notice Represents a queue of pending deposits
	struct DepositQueue {
		DepositData[] depositData; /// Array of deposits that are pending
		uint256 front; /// Index of the first element in the queue
		uint256 rear; /// Index of the next position after the last element in the queue
	}

	/// @notice Represents data for a single deposit
	/// @dev Includes deposit hash, sender address, and rejection status
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
		depositQueue.rear = 1;
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
		depositQueue.depositData.push(DepositData(depositHash, sender, false));
		depositId = depositQueue.rear;
		depositQueue.rear++;
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

	/// @notice Analyzes deposits in the queue, marking some as rejected
	/// @dev Collects deposit hashes from front to upToDepositId, skipping rejected ones
	/// @param depositQueue The storage reference to the DepositQueue struct
	/// @param upToDepositId The upper bound deposit ID for analysis
	/// @param rejectIndices Array of deposit IDs to be marked as rejected
	/// @return An array of deposit hashes that were not rejected
	function analyze(
		DepositQueue storage depositQueue,
		uint256 upToDepositId,
		uint256[] memory rejectIndices
	) internal returns (bytes32[] memory) {
		if (
			upToDepositId >= depositQueue.rear ||
			upToDepositId < depositQueue.front
		) {
			revert TriedAnalyzeOutOfRange(
				upToDepositId,
				depositQueue.front,
				depositQueue.rear - 1
			);
		}
		for (uint256 i = 0; i < rejectIndices.length; i++) {
			uint256 rejectIndex = rejectIndices[i];
			if (
				rejectIndex > upToDepositId || rejectIndex < depositQueue.front
			) {
				revert TriedToRejectOutOfRange(
					rejectIndex,
					depositQueue.front,
					upToDepositId
				);
			}
			depositQueue.depositData[rejectIndex].isRejected = true;
		}
		uint256 counter = 0;
		for (uint256 i = depositQueue.front; i <= upToDepositId; i++) {
			if (depositQueue.depositData[i].sender == address(0)) {
				continue;
			}
			if (depositQueue.depositData[i].isRejected) {
				continue;
			}
			counter++;
		}
		bytes32[] memory depositHashes = new bytes32[](counter);
		uint256 depositHashesIndex = 0;
		for (uint256 i = depositQueue.front; i <= upToDepositId; i++) {
			if (depositQueue.depositData[i].sender == address(0)) {
				continue;
			}
			if (depositQueue.depositData[i].isRejected) {
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
