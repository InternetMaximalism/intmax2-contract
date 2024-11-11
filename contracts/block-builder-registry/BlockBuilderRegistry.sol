// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IBlockBuilderRegistry} from "./IBlockBuilderRegistry.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract BlockBuilderRegistry is
	OwnableUpgradeable,
	UUPSUpgradeable,
	IBlockBuilderRegistry
{
	mapping(address => BlockBuilderInfo) public blockBuilders;
	address[] private blockBuilderAddresses;

	/// @custom:oz-upgrades-unsafe-allow constructor
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

	function updateBlockBuilder(string calldata url) external {
		if (bytes(url).length == 0) {
			revert URLIsEmpty();
		}
		BlockBuilderInfo memory info = blockBuilders[_msgSender()];
		if (bytes(info.blockBuilderUrl).length == 0) {
			blockBuilderAddresses.push(_msgSender());
		}
		info.blockBuilderUrl = url;
		info.isActive = true;
		blockBuilders[_msgSender()] = info;

		emit BlockBuilderUpdated(_msgSender(), url);
	}

	function stopBlockBuilder() external {
		// Remove the block builder information.
		BlockBuilderInfo storage info = blockBuilders[_msgSender()];
		if (bytes(info.blockBuilderUrl).length == 0) {
			revert BlockBuilderNotFound();
		}
		info.isActive = false;

		emit BlockBuilderStopped(_msgSender());
	}

	function isActiveBlockBuilder(
		address blockBuilder
	) external view returns (bool) {
		return blockBuilders[blockBuilder].isActive;
	}

	function getActiveBlockBuilders()
		external
		view
		returns (BlockBuilderInfoWithAddress[] memory)
	{
		uint256 blockBuilderLength = blockBuilderAddresses.length;
		uint256 counter = 0;
		for (uint256 i = 0; i < blockBuilderLength; i++) {
			if (blockBuilders[blockBuilderAddresses[i]].isActive) {
				counter++;
			}
		}
		BlockBuilderInfoWithAddress[]
			memory activeBlockBuilders = new BlockBuilderInfoWithAddress[](
				counter
			);
		uint256 index = 0;
		for (uint256 i = 0; i < blockBuilderLength; i++) {
			address blockBuilderAddress = blockBuilderAddresses[i];
			BlockBuilderInfo memory info = blockBuilders[blockBuilderAddress];
			if (info.isActive) {
				activeBlockBuilders[index] = BlockBuilderInfoWithAddress({
					blockBuilderAddress: blockBuilderAddress,
					info: info
				});
				index++;
			}
		}
		return activeBlockBuilders;
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
