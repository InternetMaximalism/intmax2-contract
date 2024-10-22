// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {BlockBuilderRegistry} from "../../block-builder-registry/BlockBuilderRegistry.sol";

contract BlockBuilderRegistry2Test is BlockBuilderRegistry {
	function getVal() external pure returns (uint256) {
		return 1;
	}
}
