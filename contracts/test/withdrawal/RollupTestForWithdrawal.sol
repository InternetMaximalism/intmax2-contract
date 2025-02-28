// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract RollupTestForWithdrawal {
	mapping(uint256 => bytes32) private results;

	function setTestData(uint256 blockNumber, bytes32 _hash) external {
		results[blockNumber] = _hash;
	}

	function getBlockHash(uint32 blockNumber) external view returns (bytes32) {
		return results[blockNumber];
	}
}
