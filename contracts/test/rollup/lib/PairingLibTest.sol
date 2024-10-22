// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {PairingLib} from "../../../rollup/lib/PairingLib.sol";

contract PairingLibTest {
	using PairingLib for bytes32[2];

	function pairing(
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint
	) external view returns (bool) {
		return aggregatedPublicKey.pairing(aggregatedSignature, messagePoint);
	}
}
