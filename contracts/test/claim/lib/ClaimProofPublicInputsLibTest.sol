// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ClaimProofPublicInputsLib} from "../../../claim/lib/ClaimProofPublicInputsLib.sol";

contract ClaimProofPublicInputsLibTest {
	function getHash(
		bytes32 lastClaimHash,
		address claimAggregator
	) external pure returns (uint256) {
		ClaimProofPublicInputsLib.ClaimProofPublicInputs
			memory inputs = ClaimProofPublicInputsLib.ClaimProofPublicInputs({
				lastClaimHash: lastClaimHash,
				claimAggregator: claimAggregator
			});

		return ClaimProofPublicInputsLib.getHash(inputs);
	}
}
