// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IBlockBuilderRegistry} from "./IBlockBuilderRegistry.sol";
import {MIN_STAKE_AMOUNT} from "./BlockBuilderRegistryConst.sol";

library BlockBuilderInfoLib {
	uint256 private constant CHALLENGE_DURATION = 1 days;

	/**
	 * @notice Check if the block builder is staking.
	 */
	function isStaking(
		IBlockBuilderRegistry.BlockBuilderInfo memory info
	) internal pure returns (bool) {
		return info.stakeAmount != 0;
	}

	/**
	 * @notice Check if the challenge duration has passed.
	 */
	function hasChallengeDurationPassed(
		IBlockBuilderRegistry.BlockBuilderInfo memory info
	) internal view returns (bool) {
		return block.timestamp - info.stopTime >= CHALLENGE_DURATION;
	}

	/**
	 * @notice Check if the minimum stake amount is held.
	 */
	function isStakeAmountSufficient(
		IBlockBuilderRegistry.BlockBuilderInfo memory info
	) internal pure returns (bool) {
		return info.stakeAmount >= MIN_STAKE_AMOUNT;
	}
}
