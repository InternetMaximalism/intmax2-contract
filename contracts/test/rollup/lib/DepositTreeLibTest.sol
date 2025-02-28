// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.27;

import {DepositTreeLib} from "../../../rollup/lib/DepositTreeLib.sol";

contract DepositTreeLibTest {
	using DepositTreeLib for DepositTreeLib.DepositTree;

	uint256 private constant DEPOSIT_CONTRACT_TREE_DEPTH = 32;

	DepositTreeLib.DepositTree private depositTree;

	constructor() {
		depositTree.initialize();
	}

	function getRoot() external view returns (bytes32) {
		return depositTree.getRoot();
	}

	function deposit(bytes32 leafHash) external {
		depositTree.deposit(leafHash);
	}

	function getBranch()
		external
		view
		returns (bytes32[DEPOSIT_CONTRACT_TREE_DEPTH] memory)
	{
		return depositTree.getBranch();
	}

	function getDepositCount() external view returns (uint256) {
		return depositTree.depositCount;
	}

	function getDefaultHash() external view returns (bytes32) {
		return depositTree.defaultHash;
	}

	// Helper function to get the tree depth
	function getTreeDepth() external pure returns (uint256) {
		return DEPOSIT_CONTRACT_TREE_DEPTH;
	}
}
