// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library WithdrawalProofPublicInputsLib {
	/// @notice Represents the public inputs for a withdrawal proof
	/// @param lastWithdrawalHash The hash of the last withdrawal in the chain
	/// @param withdrawalAggregator The address of the withdrawal aggregator
	struct WithdrawalProofPublicInputs {
		bytes32 lastWithdrawalHash;
		address withdrawalAggregator;
	}

	/// @notice Computes the hash of the WithdrawalProofPublicInputs
	/// @param inputs The WithdrawalProofPublicInputs to be hashed
	/// @return bytes32 The resulting hash
	function getHash(
		WithdrawalProofPublicInputs memory inputs
	) internal pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					inputs.lastWithdrawalHash,
					inputs.withdrawalAggregator
				)
			);
	}
}
