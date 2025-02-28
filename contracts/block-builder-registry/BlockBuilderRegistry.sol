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
	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize(address admin) external initializer {
		__Ownable_init(admin);
		__UUPSUpgradeable_init();
	}

	function emitHeartbeat(string calldata url) external {
		emit BlockBuilderHeartbeat(_msgSender(), url);
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
