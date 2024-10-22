// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {FraudProofPublicInputsLib} from "../../../block-builder-registry/lib/FraudProofPublicInputsLib.sol";

contract FraudProofPublicInputsLibTest {
	using FraudProofPublicInputsLib for FraudProofPublicInputsLib.FraudProofPublicInputs;

	function getHash(
		bytes32 _blockHash,
		uint32 _blockNumber,
		address _challenger
	) external pure returns (bytes32) {
		return
			FraudProofPublicInputsLib.getHash(
				FraudProofPublicInputsLib.FraudProofPublicInputs({
					blockHash: _blockHash,
					blockNumber: _blockNumber,
					challenger: _challenger
				})
			);
	}
}
