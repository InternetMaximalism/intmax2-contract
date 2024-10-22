// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {BlockHashLib} from "../../../rollup/lib/BlockHashLib.sol";

contract BlockHashLibTest {
	using BlockHashLib for bytes32[];

	bytes32[] public blockHashes;
	bytes32 public latestBlockHash;

	function pushGenesisBlockHash(bytes32 initialDepositTreeRoot) external {
		blockHashes.pushGenesisBlockHash(initialDepositTreeRoot);
		latestBlockHash = blockHashes[0];
	}

	function getBlockNumber() external view returns (uint32) {
		return BlockHashLib.getBlockNumber(blockHashes);
	}

	function getPrevHash() external view returns (bytes32) {
		return BlockHashLib.getPrevHash(blockHashes);
	}

	function pushBlockHash(
		bytes32 depositTreeRoot,
		bytes32 signatureHash
	) external returns (bytes32) {
		bytes32 newBlockHash = blockHashes.pushBlockHash(
			depositTreeRoot,
			signatureHash
		);
		latestBlockHash = newBlockHash;
		return newBlockHash;
	}

	function getBlockHash(uint256 index) external view returns (bytes32) {
		// solhint-disable-next-line gas-custom-errors
		require(index < blockHashes.length, "Index out of bounds");
		return blockHashes[index];
	}
}
