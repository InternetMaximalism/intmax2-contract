// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.27;

import {DepositLib} from "../../common/DepositLib.sol";

/**
 * @title DepositTreeLib
 * @notice Library for managing a sparse Merkle tree for deposits in the Intmax2 protocol
 * @dev Based on https://github.com/0xPolygonHermez/zkevm-contracts/blob/main/contracts/lib/DepositContract.sol
 * Implements an incremental Merkle tree for efficiently tracking deposits
 */
library DepositTreeLib {
	/**
	 * @notice Error thrown when the Merkle tree is full
	 * @dev Thrown when attempting to add a deposit to a tree that has reached its maximum capacity
	 */
	error MerkleTreeFull();

	/**
	 * @notice Depth of the Merkle tree
	 * @dev The tree has a maximum of 2^32 - 1 leaves
	 */
	uint256 internal constant _DEPOSIT_CONTRACT_TREE_DEPTH = 32;

	/**
	 * @notice Structure representing the deposit tree
	 * @dev Contains the branch nodes, deposit count, and default hash for empty nodes
	 * @param _branch Array of branch nodes at each height of the tree
	 * @param depositCount Total number of deposits added to the tree
	 * @param defaultHash Hash value used for empty nodes
	 */
	struct DepositTree {
		bytes32[_DEPOSIT_CONTRACT_TREE_DEPTH] _branch;
		uint256 depositCount;
		bytes32 defaultHash;
	}

	/**
	 * @notice Maximum number of deposits allowed in the tree
	 * @dev Ensures depositCount fits into 32 bits (2^32 - 1)
	 */
	uint256 internal constant _MAX_DEPOSIT_COUNT =
		2 ** _DEPOSIT_CONTRACT_TREE_DEPTH - 1;

	/**
	 * @notice Initializes the deposit tree with default values
	 * @dev Sets up the default hash using an empty Deposit struct
	 * @param depositTree The storage reference to the DepositTree struct
	 */
	function initialize(DepositTree storage depositTree) internal {
		depositTree.defaultHash = DepositLib.getHash(
			DepositLib.Deposit(
				0x0000000000000000000000000000000000000000,
				0,
				0,
				0,
				false // isEligible
			)
		);
	}

	/**
	 * @notice Computes and returns the current Merkle root
	 * @dev Calculates the root by combining branch nodes with zero hashes
	 * @param depositTree The memory reference to the DepositTree struct
	 * @return The computed Merkle root hash
	 */
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

	/**
	 * @notice Adds a new leaf to the Merkle tree
	 * @dev Updates the appropriate branch node and increments the deposit count
	 * @param depositTree The storage reference to the DepositTree struct
	 * @param leafHash The hash of the new deposit leaf to be added
	 */
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

	/**
	 * @notice Retrieves the current branch nodes of the Merkle tree
	 * @dev Used for generating Merkle proofs or debugging
	 * @param depositTree The storage reference to the DepositTree struct
	 * @return Array of branch node hashes at each height of the tree
	 */
	function getBranch(
		DepositTree storage depositTree
	) internal view returns (bytes32[_DEPOSIT_CONTRACT_TREE_DEPTH] memory) {
		return depositTree._branch;
	}
}
