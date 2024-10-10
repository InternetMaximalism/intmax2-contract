// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library BlockHashLib {
	/// @notice Pushes the genesis block hash to the block hashes array
	/// @param blockHashes The storage array of block hashes
	/// @param initialDepositTreeRoot The initial deposit tree root for the genesis block
	function pushGenesisBlockHash(
		bytes32[] storage blockHashes,
		bytes32 initialDepositTreeRoot
	) internal {
		blockHashes.push(_calcBlockHash(0, initialDepositTreeRoot, 0, 0));
	}

	/// @notice Gets the current block number based on the number of block hashes
	/// @param blockHashes The memory array of block hashes
	/// @return The current block number
	function getBlockNumber(
		bytes32[] storage blockHashes
	) internal view returns (uint32) {
		return uint32(blockHashes.length);
	}

	/// @notice Gets the hash of the previous block
	/// @param blockHashes The memory array of block hashes
	/// @return The hash of the previous block
	function getPrevHash(
		bytes32[] storage blockHashes
	) internal view returns (bytes32) {
		return blockHashes[blockHashes.length - 1];
	}

	/// @notice Pushes a new block hash to the block hashes array
	/// @param blockHashes The storage array of block hashes
	/// @param depositTreeRoot The deposit tree root for the new block
	/// @param signatureHash The signature hash for the new block
	/// @return blockHash The newly calculated and pushed block hash
	function pushBlockHash(
		bytes32[] storage blockHashes,
		bytes32 depositTreeRoot,
		bytes32 signatureHash
	) internal returns (bytes32 blockHash) {
		blockHash = _calcBlockHash(
			getPrevHash(blockHashes),
			depositTreeRoot,
			signatureHash,
			getBlockNumber(blockHashes)
		);
		blockHashes.push(blockHash);
	}

	/// @notice Calculates the block hash based on input parameters
	/// @param prevBlockHash The hash of the previous block
	/// @param depositTreeRoot The deposit tree root for the current block
	/// @param signatureHash The signature hash for the current block
	/// @param blockNumber The current block number
	/// @return The calculated block hash
	function _calcBlockHash(
		bytes32 prevBlockHash,
		bytes32 depositTreeRoot,
		bytes32 signatureHash,
		uint32 blockNumber
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					prevBlockHash,
					depositTreeRoot,
					signatureHash,
					blockNumber
				)
			);
	}
}
