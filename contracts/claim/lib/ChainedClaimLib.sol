// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/// @title ChainedClaimLib
/// @notice Library for handling chained claims in a hash chain for claim verification
/// @dev Provides functionality to hash and verify chains of claims
library ChainedClaimLib {
	/// @notice Represents a claim linked in a hash chain, used in claim proof public inputs
	/// @param recipient The address of the claim recipient
	/// @param amount The amount of tokens being withdrawn
	/// @param nullifier The nullifier of the claim
	/// @param blockHash The hash of the block containing the claim
	/// @param blockNumber The number of the block containing the claim
	struct ChainedClaim {
		address recipient;
		uint256 amount;
		bytes32 nullifier;
		bytes32 blockHash;
		uint32 blockNumber;
	}

	/// @notice Hashes a ChainedClaim with the previous hash in the chain
	/// @dev Creates a hash that links this claim to the previous one in the chain
	/// @param claim The ChainedClaim to be hashed
	/// @param prevClaimHash The hash of the previous claim in the chain
	/// @return bytes32 The resulting hash that links this claim in the chain
	function hashWithPrevHash(
		ChainedClaim memory claim,
		bytes32 prevClaimHash
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					prevClaimHash,
					claim.recipient,
					claim.amount,
					claim.nullifier,
					claim.blockHash,
					claim.blockNumber
				)
			);
	}

	/// @notice Verifies the integrity of a claim hash chain
	/// @dev Recalculates the hash chain and compares with the expected last hash
	/// @param claims Array of ChainedClaims to verify
	/// @param lastClaimHash The expected hash of the last claim in the chain
	/// @return bool True if the chain is valid, false otherwise
	function verifyClaimChain(
		ChainedClaim[] memory claims,
		bytes32 lastClaimHash
	) internal pure returns (bool) {
		bytes32 prevClaimHash = 0;
		for (uint256 i = 0; i < claims.length; i++) {
			ChainedClaim memory claim = claims[i];
			prevClaimHash = hashWithPrevHash(claim, prevClaimHash);
		}
		if (prevClaimHash != lastClaimHash) {
			return false;
		}
		return true;
	}
}
