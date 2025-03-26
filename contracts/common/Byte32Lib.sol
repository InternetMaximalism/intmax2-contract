// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title Byte32Lib
 * @notice Library for manipulating bytes32 values
 * @dev Provides utility functions for working with bytes32 data types
 */
library Byte32Lib {
	/**
	 * @notice Splits a bytes32 value into an array of 8 uint256 values
	 * @dev Each uint256 in the resulting array represents 4 bytes (32 bits) of the original input
	 * @param input The bytes32 value to be split
	 * @return An array of 8 uint256 values, each representing 4 bytes of the input
	 */
	function split(bytes32 input) internal pure returns (uint256[] memory) {
		uint256[] memory parts = new uint256[](8);
		for (uint256 i = 0; i < 8; i++) {
			parts[i] = uint256(uint32(bytes4(input << (i * 32))));
		}
		return parts;
	}
}
