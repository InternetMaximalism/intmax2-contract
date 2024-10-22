// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract RollupTestForBlockBuilderRegistry {
	struct Result {
		bytes32 testHash;
		address testAddress;
	}
	mapping(uint256 => Result) private results;

	function setTestData(
		uint256 blockNumber,
		bytes32 _hash,
		address _address
	) external {
		results[blockNumber] = Result(_hash, _address);
	}

	function getBlockBuilder(
		uint32 blockNumber
	) external view returns (address) {
		return results[blockNumber].testAddress;
	}

	function getBlockHash(uint32 blockNumber) external view returns (bytes32) {
		return results[blockNumber].testHash;
	}

	function getBlockHashAndBuilder(
		uint256 _key
	) external view returns (bytes32, address) {
		return (results[_key].testHash, results[_key].testAddress);
	}
}
