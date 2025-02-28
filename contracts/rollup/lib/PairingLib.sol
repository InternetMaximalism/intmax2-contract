// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library PairingLib {
	/// @notice Error thrown when the pairing operation fails
	error PairingOpCodeFailed();

	/// @dev X-coordinate of the negated generator point G1
	uint256 internal constant NEG_G1_X = 1;
	/// @dev Y-coordinate of the negated generator point G1
	uint256 internal constant NEG_G1_Y =
		21888242871839275222246405745257275088696311157297823662689037894645226208581;

	/// @notice Performs an elliptic curve pairing operation
	/// @param aggregatedPublicKey The aggregated public key (2 32-byte elements)
	/// @param aggregatedSignature The aggregated signature (4 32-byte elements)
	/// @param messagePoint The message point (4 32-byte elements)
	/// @return bool True if the pairing is valid, false otherwise
	function pairing(
		bytes32[2] calldata aggregatedPublicKey,
		bytes32[4] calldata aggregatedSignature,
		bytes32[4] calldata messagePoint
	) internal view returns (bool) {
		bytes memory input = abi.encodePacked(
			aggregatedPublicKey,
			messagePoint,
			[NEG_G1_X, NEG_G1_Y],
			aggregatedSignature
		);
		uint256[1] memory out;
		bool success;
		uint256 inputSize = input.length;
		// solhint-disable-next-line no-inline-assembly
		assembly {
			success := staticcall(
				sub(gas(), 2000),
				8,
				add(input, 0x20),
				inputSize,
				out,
				0x20
			)
			// Use "invalid" to make gas estimation work
			switch success
			case 0 {
				invalid()
			}
		}
		if (!success) {
			revert PairingOpCodeFailed();
		}
		return out[0] != 0;
	}
}
