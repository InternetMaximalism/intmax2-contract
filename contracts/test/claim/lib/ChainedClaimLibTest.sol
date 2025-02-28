// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ChainedClaimLib} from "../../../claim/lib/ChainedClaimLib.sol";

contract ChainedClaimLibTest {
	function verifyClaimChain(
		ChainedClaimLib.ChainedClaim[] memory claims,
		bytes32 prevClaimHash
	) external pure returns (bool) {
		return ChainedClaimLib.verifyClaimChain(claims, prevClaimHash);
	}
}
