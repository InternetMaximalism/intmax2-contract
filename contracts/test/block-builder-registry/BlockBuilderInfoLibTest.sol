// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {BlockBuilderInfoLib} from "../../block-builder-registry/BlockBuilderInfoLib.sol";
import {IBlockBuilderRegistry} from "../../block-builder-registry/IBlockBuilderRegistry.sol";

contract BlockBuilderInfoLibTest {
	using BlockBuilderInfoLib for IBlockBuilderRegistry.BlockBuilderInfo;

	function isStaking(
		IBlockBuilderRegistry.BlockBuilderInfo memory info
	) external pure returns (bool) {
		return info.isStaking();
	}

	function hasChallengeDurationPassed(
		IBlockBuilderRegistry.BlockBuilderInfo memory info
	) external view returns (bool) {
		return info.hasChallengeDurationPassed();
	}

	function isStakeAmountSufficient(
		IBlockBuilderRegistry.BlockBuilderInfo memory info
	) external pure returns (bool) {
		return info.isStakeAmountSufficient();
	}
}
