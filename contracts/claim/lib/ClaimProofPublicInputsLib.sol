// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library ClaimProofPublicInputsLib {
	/// @notice Represents the public inputs for a claim proof
	struct ClaimProofPublicInputs {
		bytes32 lastClaimHash; // Hash of the last claim in the chain
		address claimAggregator; // Address of the claim aggregator
	}

	/// @notice Computes the hash of the ClaimProofPublicInputs
	/// @param inputs The ClaimProofPublicInputs to be hashed
	/// @return bytes32 The resulting hash
	function getHash(
		ClaimProofPublicInputs memory inputs
	) internal pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(inputs.lastClaimHash, inputs.claimAggregator)
			);
	}
}
