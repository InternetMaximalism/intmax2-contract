// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {DepositQueueLib} from "../../../liquidity/lib/DepositQueueLib.sol";

contract DepositQueueLibTest {
	using DepositQueueLib for DepositQueueLib.DepositQueue;

	DepositQueueLib.DepositQueue private depositQueue;
	DepositQueueLib.DepositData public deletedData;
	uint256 public latestDepositId;
	bytes32[] public latestDepositHashes;

	constructor() {
		depositQueue.initialize();
	}

	function enqueue(bytes32 depositHash, address sender) external {
		latestDepositId = depositQueue.enqueue(depositHash, sender);
	}

	function deleteDeposit(uint256 depositId) external {
		deletedData = depositQueue.deleteDeposit(depositId);
	}

	function analyze(uint256 upToDepositId) external {
		latestDepositHashes = depositQueue.analyze(upToDepositId);
	}

	// Helper functions to access internal state for testing
	function getFront() external view returns (uint256) {
		return depositQueue.front;
	}

	function getRear() external view returns (uint256) {
		return depositQueue.depositData.length;
	}

	function getDepositData(
		uint256 depositId
	) external view returns (DepositQueueLib.DepositData memory) {
		return depositQueue.depositData[depositId];
	}
}
