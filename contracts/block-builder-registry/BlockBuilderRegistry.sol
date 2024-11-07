// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IBlockBuilderRegistry} from "./IBlockBuilderRegistry.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {MIN_STAKE_AMOUNT} from "./BlockBuilderRegistryConst.sol";
import {BlockBuilderInfoLib} from "./BlockBuilderInfoLib.sol";

contract BlockBuilderRegistry is
	OwnableUpgradeable,
	UUPSUpgradeable,
	IBlockBuilderRegistry
{
	mapping(address => BlockBuilderInfo) public blockBuilders;
	address[] private blockBuilderAddresses;

	using BlockBuilderInfoLib for BlockBuilderInfo;

	modifier isStaking() {
		if (!blockBuilders[_msgSender()].isStaking()) {
			revert BlockBuilderNotFound();
		}
		_;
	}

	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initialize the contract.
	 */
	function initialize() external initializer {
		__Ownable_init(_msgSender());
		__UUPSUpgradeable_init();
	}

	function updateBlockBuilder(string calldata url) external payable {
		if (bytes(url).length == 0) {
			revert URLIsEmpty();
		}
		BlockBuilderInfo memory info = blockBuilders[_msgSender()];
		if (bytes(info.blockBuilderUrl).length == 0) {
			blockBuilderAddresses.push(_msgSender());
		}
		uint256 stakeAmount = info.stakeAmount + msg.value;
		if (stakeAmount < MIN_STAKE_AMOUNT) {
			revert InsufficientStakeAmount();
		}
		info.blockBuilderUrl = url;
		info.stakeAmount = stakeAmount;
		info.stopTime = 0;
		info.isValid = true;
		blockBuilders[_msgSender()] = info;

		emit BlockBuilderUpdated(_msgSender(), url, stakeAmount);
	}

	function stopBlockBuilder() external isStaking {
		// Remove the block builder information.
		BlockBuilderInfo storage info = blockBuilders[_msgSender()];
		info.stopTime = block.timestamp;
		info.isValid = false;

		emit BlockBuilderStopped(_msgSender());
	}

	function isValidBlockBuilder(
		address blockBuilder
	) external view returns (bool) {
		return blockBuilders[blockBuilder].isValid;
	}

	function getValidBlockBuilders()
		external
		view
		returns (BlockBuilderInfoWithAddress[] memory)
	{
		uint256 blockBuilderLength = blockBuilderAddresses.length;
		uint256 counter = 0;
		for (uint256 i = 0; i < blockBuilderLength; i++) {
			if (blockBuilders[blockBuilderAddresses[i]].isValid) {
				counter++;
			}
		}
		BlockBuilderInfoWithAddress[]
			memory validBlockBuilders = new BlockBuilderInfoWithAddress[](
				counter
			);
		uint256 index = 0;
		for (uint256 i = 0; i < blockBuilderLength; i++) {
			address blockBuilderAddress = blockBuilderAddresses[i];
			BlockBuilderInfo memory info = blockBuilders[blockBuilderAddress];
			if (info.isValid) {
				validBlockBuilders[index] = BlockBuilderInfoWithAddress({
					blockBuilderAddress: blockBuilderAddress,
					info: info
				});
				index++;
			}
		}
		return validBlockBuilders;
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
