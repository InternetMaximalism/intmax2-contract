// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title PairingLib
 * @notice Library for elliptic curve pairing operations used in signature verification
 * @dev Provides utilities for verifying BLS signatures using the precompiled pairing contract
 */
library PairingLib {
	/**
	 * @notice Error thrown when the elliptic curve pairing operation fails
	 * @dev This can happen if the precompiled contract call fails or returns an invalid result
	 */
	error PairingOpCodeFailed();

	/**
	 * @notice X-coordinate of the negated generator point G1
	 * @dev Used in the pairing check to verify signatures
	 */
	uint256 internal constant NEG_G1_X = 1;
	/**
	 * @notice Y-coordinate of the negated generator point G1
	 * @dev Used in the pairing check to verify signatures
	 */
	uint256 internal constant NEG_G1_Y =
		21888242871839275222246405745257275088696311157297823662689037894645226208581;

	/**
	 * @notice Performs an elliptic curve pairing operation to verify a BLS signature
	 * @dev Uses the precompiled contract at address 8 to perform the pairing check
	 * @param aggregatedPublicKey The aggregated public key (2 32-byte elements representing a G1 point)
	 * @param aggregatedSignature The aggregated signature (4 32-byte elements representing a G2 point)
	 * @param messagePoint The message point (4 32-byte elements representing a G2 point)
	 * @return bool True if the signature is valid (pairing check passes), false otherwise
	 */
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
