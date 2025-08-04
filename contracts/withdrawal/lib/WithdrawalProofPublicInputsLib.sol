// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title WithdrawalProofPublicInputsLib
 * @notice Library for handling public inputs of withdrawal zero-knowledge proofs
 * @dev Provides utilities for working with the public inputs that are part of withdrawal proof verification
 */
library WithdrawalProofPublicInputsLib {
	/**
	 * @notice Represents the public inputs for a withdrawal zero-knowledge proof
	 * @dev Contains the final hash of the withdrawal chain and the aggregator address
	 * @param lastWithdrawalHash The hash of the last withdrawal in the chain, used to verify the integrity of the withdrawal chain
	 * @param withdrawalAggregator The address of the withdrawal aggregator who is authorized to submit the proof
	 */
	struct WithdrawalProofPublicInputs {
		bytes32 lastWithdrawalHash;
		address withdrawalAggregator;
	}

	/**
	 * @notice Computes the hash of the WithdrawalProofPublicInputs
	 * @dev This hash is used as input to the zero-knowledge proof verification
	 * @param inputs The WithdrawalProofPublicInputs struct to be hashed
	 * @return bytes32 The resulting hash that is masked to fit within 253 bits
	 */
	function getHash(
		WithdrawalProofPublicInputs memory inputs
	) internal pure returns (uint256) {
		return
			uint256(keccak256(
				abi.encodePacked(
					inputs.lastWithdrawalHash,
					inputs.withdrawalAggregator
				)
			)) & ((1 << 253) - 1);
	}
}
