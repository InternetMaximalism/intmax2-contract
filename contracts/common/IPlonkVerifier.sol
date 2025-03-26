// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title IPlonkVerifier
 * @notice Interface for verifying PLONK zero-knowledge proofs
 * @dev This interface is implemented by contracts that verify PLONK proofs generated using the gnark library
 */
interface IPlonkVerifier {
	/**
	 * @notice Verify a PLONK zero-knowledge proof
	 * @dev Reverts if the proof or the public inputs are malformed
	 * @param proof Serialized PLONK proof (using gnark's MarshalSolidity format)
	 * @param publicInputs Array of public inputs to the proof (must be in reduced form)
	 * @return success True if the proof is valid, false otherwise
	 */
	// solhint-disable-next-line func-name-mixedcase
	function Verify(
		bytes calldata proof,
		uint256[] calldata publicInputs
	) external view returns (bool success);
}
