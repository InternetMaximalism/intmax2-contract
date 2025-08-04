// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title ClaimProofPublicInputsLib
 * @notice Library for handling public inputs for claim proofs
 * @dev Provides functionality to hash and verify claim proof public inputs
 */
library ClaimProofPublicInputsLib {
	/**
	 * @notice Represents the public inputs for a claim proof verification
	 * @dev Contains the last claim hash and the aggregator address
	 */
	struct ClaimProofPublicInputs {
		bytes32 lastClaimHash; // Hash of the last claim in the chain
		address claimAggregator; // Address of the claim aggregator
	}

	/**
	 * @notice Computes the hash of the ClaimProofPublicInputs for verification
	 * @dev Used in the ZK proof verification process
	 * @param inputs The ClaimProofPublicInputs to be hashed
	 * @return bytes32 The resulting hash that is masked to fit within 253 bits
	 */
	function getHash(
		ClaimProofPublicInputs memory inputs
	) internal pure returns (uint256) {
		return
			uint256(keccak256(
				abi.encodePacked(inputs.lastClaimHash, inputs.claimAggregator)
			)) & ((1 << 253) - 1);
	}
}
