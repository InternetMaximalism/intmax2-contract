// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {Byte32Lib} from "../../common/Byte32Lib.sol";

contract Byte32LibTest {
	using Byte32Lib for bytes32;

	function split(bytes32 input) external pure returns (uint256[] memory) {
		return input.split();
	}

	function createBytes32FromUints(
		uint256[] memory uints
	) external pure returns (bytes32) {
		// solhint-disable-next-line gas-custom-errors
		require(uints.length == 8, "Input must have 8 elements");
		bytes32 result;
		for (uint256 i = 0; i < 8; i++) {
			result |= bytes32(uints[i] << (224 - i * 32));
		}
		return result;
	}
}
