// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IPlonkVerifier {
	/// Verify a Plonk proof.
	/// Reverts if the proof or the public inputs are malformed.
	/// @param proof serialised plonk proof (using gnark's MarshalSolidity)
	/// @param publicInputs (must be reduced)
	/// @return success true if the proof passes false otherwise
	// solhint-disable-next-line func-name-mixedcase
	function Verify(
		bytes calldata proof,
		uint256[] calldata publicInputs
	) external view returns (bool success);
}
