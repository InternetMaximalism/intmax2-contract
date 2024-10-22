// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {WithdrawalProofPublicInputsLib} from "../../../withdrawal/lib/WithdrawalProofPublicInputsLib.sol";

contract WithdrawalProofPublicInputsLibTest {
	function getHash(
		bytes32 lastWithdrawalHash,
		address withdrawalAggregator
	) external pure returns (bytes32) {
		WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs
			memory inputs = WithdrawalProofPublicInputsLib
				.WithdrawalProofPublicInputs({
					lastWithdrawalHash: lastWithdrawalHash,
					withdrawalAggregator: withdrawalAggregator
				});

		return WithdrawalProofPublicInputsLib.getHash(inputs);
	}

	function createInputs(
		bytes32 lastWithdrawalHash,
		address withdrawalAggregator
	)
		external
		pure
		returns (
			WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs memory
		)
	{
		return
			WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs({
				lastWithdrawalHash: lastWithdrawalHash,
				withdrawalAggregator: withdrawalAggregator
			});
	}
}
