// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.27;

import {DepositLib} from "../../common/DepositLib.sol";

/// @title DepositTreeLib
/// @notice Library for managing a sparse Merkle tree for deposits
/// @dev Based on https://github.com/0xPolygonHermez/zkevm-contracts/blob/main/contracts/lib/DepositContract.sol
library DepositTreeLib {
	/// @notice Error thrown when the Merkle tree is full
	error MerkleTreeFull();

	/// @dev Depth of the Merkle tree
	uint256 internal constant _DEPOSIT_CONTRACT_TREE_DEPTH = 32;

	/// @notice Structure representing the deposit tree
	struct DepositTree {
		bytes32[_DEPOSIT_CONTRACT_TREE_DEPTH] _branch;
		uint256 depositCount;
		bytes32 defaultHash;
	}

	/// @dev Maximum number of deposits (ensures depositCount fits into 32 bits)
	uint256 internal constant _MAX_DEPOSIT_COUNT =
		2 ** _DEPOSIT_CONTRACT_TREE_DEPTH - 1;

	/// @notice Initializes the deposit tree
	/// @param depositTree The storage reference to the DepositTree struct
	function initialize(DepositTree storage depositTree) internal {
		depositTree.defaultHash = DepositLib.getHash(
			DepositLib.Deposit(0, 0, 0)
		);
	}

	/// @notice Computes and returns the Merkle root
	/// @param depositTree The memory reference to the DepositTree struct
	/// @return The computed Merkle root
	function getRoot(
		DepositTree memory depositTree
	) internal pure returns (bytes32) {
		bytes32 node = depositTree.defaultHash;
		uint256 size = depositTree.depositCount;
		bytes32 currentZeroHashHeight = depositTree.defaultHash;

		for (
			uint256 height = 0;
			height < _DEPOSIT_CONTRACT_TREE_DEPTH;
			height++
		) {
			if (((size >> height) & 1) == 1)
				node = keccak256(
					abi.encodePacked(depositTree._branch[height], node)
				);
			else
				node = keccak256(abi.encodePacked(node, currentZeroHashHeight));

			currentZeroHashHeight = keccak256(
				abi.encodePacked(currentZeroHashHeight, currentZeroHashHeight)
			);
		}
		return node;
	}

	/// @notice Adds a new leaf to the Merkle tree
	/// @param depositTree The storage reference to the DepositTree struct
	/// @param leafHash The hash of the new leaf to be added
	function deposit(
		DepositTree storage depositTree,
		bytes32 leafHash
	) internal {
		bytes32 node = leafHash;
		uint256 depositCount = depositTree.depositCount;

		// Avoid overflowing the Merkle tree (and prevent edge case in computing `_branch`)
		if (depositCount >= _MAX_DEPOSIT_COUNT) {
			revert MerkleTreeFull();
		}

		uint256 size = depositCount + 1;
		depositTree.depositCount = size;
		for (
			uint256 height = 0;
			height < _DEPOSIT_CONTRACT_TREE_DEPTH;
			height++
		) {
			if (((size >> height) & 1) == 1) {
				depositTree._branch[height] = node;
				return;
			}
			node = keccak256(
				abi.encodePacked(depositTree._branch[height], node)
			);
		}
		// As the loop should always end prematurely with the `return` statement,
		// this code should be unreachable. We assert `false` just to be safe.
		assert(false);
	}

	/// @notice Retrieves the current branch of the Merkle tree
	/// @param depositTree The storage reference to the DepositTree struct
	/// @return The current branch of the Merkle tree
	function getBranch(
		DepositTree storage depositTree
	) internal view returns (bytes32[_DEPOSIT_CONTRACT_TREE_DEPTH] memory) {
		return depositTree._branch;
	}
}
