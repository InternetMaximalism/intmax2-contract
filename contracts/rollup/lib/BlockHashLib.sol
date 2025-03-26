// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title BlockHashLib
 * @notice Library for managing block hashes in the Intmax2 rollup chain
 * @dev Provides utilities for calculating, storing, and retrieving block hashes
 */
library BlockHashLib {
	/**
	 * @notice Pushes the genesis block hash to the block hashes array
	 * @dev Creates the first block hash with special parameters for the genesis block
	 * @param blockHashes The storage array of block hashes
	 * @param initialDepositTreeRoot The initial deposit tree root for the genesis block
	 */
	function pushGenesisBlockHash(
		bytes32[] storage blockHashes,
		bytes32 initialDepositTreeRoot
	) internal {
		blockHashes.push(_calcBlockHash(0, initialDepositTreeRoot, 0, 0, 0));
	}

	/**
	 * @notice Gets the current block number based on the number of block hashes
	 * @dev The block number is equal to the length of the blockHashes array
	 * @param blockHashes The storage array of block hashes
	 * @return The current block number (length of the blockHashes array)
	 */
	function getBlockNumber(
		bytes32[] storage blockHashes
	) internal view returns (uint32) {
		return uint32(blockHashes.length);
	}

	/**
	 * @notice Gets the hash of the previous block
	 * @dev Returns the last element in the blockHashes array
	 * @param blockHashes The storage array of block hashes
	 * @return The hash of the previous block
	 */
	function getPrevHash(
		bytes32[] storage blockHashes
	) internal view returns (bytes32) {
		return blockHashes[blockHashes.length - 1];
	}

	/**
	 * @notice Pushes a new block hash to the block hashes array
	 * @dev Calculates the block hash based on inputs and appends it to the array
	 * @param blockHashes The storage array of block hashes
	 * @param depositTreeRoot The deposit tree root for the new block
	 * @param signatureHash The signature hash for the new block
	 * @param timestamp The timestamp of the new block
	 * @return blockHash The newly calculated and pushed block hash
	 */
	function pushBlockHash(
		bytes32[] storage blockHashes,
		bytes32 depositTreeRoot,
		bytes32 signatureHash,
		uint64 timestamp
	) internal returns (bytes32 blockHash) {
		blockHash = _calcBlockHash(
			getPrevHash(blockHashes),
			depositTreeRoot,
			signatureHash,
			timestamp,
			getBlockNumber(blockHashes)
		);
		blockHashes.push(blockHash);
	}

	/**
	 * @notice Calculates the block hash based on input parameters
	 * @dev Uses keccak256 to hash the concatenated block components
	 * @param prevBlockHash The hash of the previous block
	 * @param depositTreeRoot The deposit tree root for the current block
	 * @param signatureHash The signature hash for the current block
	 * @param timestamp The timestamp of the current block
	 * @param blockNumber The current block number
	 * @return The calculated block hash
	 */
	function _calcBlockHash(
		bytes32 prevBlockHash,
		bytes32 depositTreeRoot,
		bytes32 signatureHash,
		uint64 timestamp,
		uint32 blockNumber
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					prevBlockHash,
					depositTreeRoot,
					signatureHash,
					timestamp,
					blockNumber
				)
			);
	}
}
