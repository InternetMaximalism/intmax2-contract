// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library Byte32Lib {
	/// @notice Splits a bytes32 into an array of uint256, each representing 4 bytes
	/// @param input The bytes32 value to be split
	/// @return An array of 8 uint256 values, each representing 4 bytes of the input
	function split(bytes32 input) internal pure returns (uint256[] memory) {
		uint256[] memory parts = new uint256[](8);
		for (uint256 i = 0; i < 8; i++) {
			parts[i] = uint256(uint32(bytes4(input << (i * 32))));
		}
		return parts;
	}
}
