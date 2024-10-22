// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library FraudProofPublicInputsLib {
	/// @notice Public inputs for fraud proof
	/// @dev This structure contains the necessary public inputs for a fraud proof
	struct FraudProofPublicInputs {
		/// @notice Hash of the block to be slashed
		bytes32 blockHash;
		/// @notice Number of the block to be slashed
		uint32 blockNumber;
		/// @notice Address of the proof submitter (challenger)
		/// @dev Included in public inputs to prevent MEV attacks
		address challenger;
	}

	/// @notice Calculates the hash of the public inputs
	/// @param inputs The FraudProofPublicInputs structure
	/// @return The calculated hash of the inputs
	function getHash(
		FraudProofPublicInputs memory inputs
	) internal pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					inputs.blockHash,
					inputs.blockNumber,
					inputs.challenger
				)
			);
	}
}
