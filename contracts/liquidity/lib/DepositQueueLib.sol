// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library DepositQueueLib {
	error TriedCollectDepositsNotAnalyzedYet(
		uint256 upToDepositId,
		uint256 lastAnalyzedDepositId
	);

	error TriedAnalyzeNotExists(uint256 upToDepositId, uint256 lastDepositId);

	error TriedToRejectOutOfRange(uint256 rejectIndex, uint256 upToDepositId);

	error UpToDepositIdIsTooOld(
		uint256 upToDepositId,
		uint256 lastAnalyzedDepositId
	);

	error DepositIdIsNotInQueue(uint256 depositId, uint256 front, uint256 rear);

	/**
	 * @title depositQueue
	 * @dev Represents a queue of pending deposits.
	 */
	struct DepositQueue {
		DepositData[] depositData; ///< Array of deposits that are pending.
		uint256 front; ///< Index of the first element in the queue.
		uint256 rear; ///< Index of the next position after the last element in the queue.
		uint256 lastAnalyzedDepositId; ///< Index of the last analyzed deposit. Must satisfy lastAnalyzedDepositId < rear.
	}

	struct DepositData {
		bytes32 depositHash;
		address sender;
		bool isRejected;
	}

	function initialize(DepositQueue storage depositQueue) internal {
		depositQueue.front = 0;
		depositQueue.rear = 0;
		depositQueue.lastAnalyzedDepositId = 0;
	}

	function enqueue(
		DepositQueue storage depositQueue,
		bytes32 depositHash,
		address sender
	) internal returns (uint256 depositId) {
		depositQueue.depositData.push(DepositData(depositHash, sender, false));
		depositId = depositQueue.rear;
		depositQueue.rear++;
	}

	function deleteDeposit(
		DepositQueue storage depositQueue,
		uint256 depositId
	) internal returns (DepositData memory depositData) {
		if (depositId < depositQueue.front || depositId >= depositQueue.rear) {
			revert DepositIdIsNotInQueue(
				depositId,
				depositQueue.front,
				depositQueue.rear
			);
		}
		depositData = depositQueue.depositData[depositId];
		delete depositQueue.depositData[depositId];
	}

	function analyze(
		DepositQueue storage depositQueue,
		uint256 upToDepositId,
		uint256[] memory rejectIndices
	) internal {
		// assert that depositQueue.lastAnalyzedDepositId < upToDepositId
		if (depositQueue.lastAnalyzedDepositId >= upToDepositId) {
			revert UpToDepositIdIsTooOld(
				upToDepositId,
				depositQueue.lastAnalyzedDepositId
			);
		}
		// assert that upToDepositId < rear
		if (upToDepositId >= depositQueue.rear) {
			revert TriedAnalyzeNotExists(upToDepositId, depositQueue.rear);
		}

		for (uint i = 0; i < rejectIndices.length; i++) {
			uint256 rejectIndex = rejectIndices[i];
			if (rejectIndex > upToDepositId) {
				revert TriedToRejectOutOfRange(rejectIndex, upToDepositId);
			}
			depositQueue.depositData[rejectIndex].isRejected = true;
		}
		depositQueue.lastAnalyzedDepositId = upToDepositId;
	}

	// accepted deposits are the deposits that have been analyzed and are not rejected.
	function collectAcceptedDeposits(
		DepositQueue storage depositQueue,
		uint256 upToDepositId
	) internal returns (bytes32[] memory) {
		if (depositQueue.lastAnalyzedDepositId < upToDepositId) {
			revert TriedCollectDepositsNotAnalyzedYet(
				upToDepositId,
				depositQueue.lastAnalyzedDepositId
			);
		}
		uint256 acceptedDepositsCount = 0;
		for (
			uint256 i = depositQueue.front;
			i <= upToDepositId; // assumed that upToDepositId <= lastAnalyzedDepositId < rear
			i++
		) {
			if (!depositQueue.depositData[i].isRejected) {
				acceptedDepositsCount++;
			}
		}
		bytes32[] memory depositHashes = new bytes32[](acceptedDepositsCount);
		for (uint256 i = depositQueue.front; i <= upToDepositId; i++) {
			if (!depositQueue.depositData[i].isRejected) {
				DepositData storage depositData = depositQueue.depositData[i];
				depositHashes[i] = depositData.depositHash;
				// delete depositData to save gas
				delete depositData.sender;
				delete depositData.depositHash;
			}
		}
		// because front <= upToDepositId < rear, we can safely update front
		depositQueue.front = upToDepositId + 1;
		return depositHashes;
	}
}
