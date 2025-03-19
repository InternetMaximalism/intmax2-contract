// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IPermitter} from "./IPermitter.sol";
import {PredicateClient} from "@predicate/contracts/src/mixins/PredicateClient.sol";
import {PredicateMessage} from "@predicate/contracts/src/interfaces/IPredicateClient.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PredicatePermitter is
	PredicateClient,
	UUPSUpgradeable,
	OwnableUpgradeable,
	IPermitter
{
	function initialize(address _admin) external initializer {
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
	}

	function permit(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external returns (bool) {
		PredicateMessage memory predicateMessage = abi.decode(
			permission,
			(PredicateMessage)
		);
		return
			_authorizeTransaction(predicateMessage, encodedData, user, value);
	}

	function setPolicy(string memory policyID) external onlyOwner {
		_setPolicy(policyID);
	}

	function setPredicateManager(address serviceManager) external onlyOwner {
		_setPredicateManager(serviceManager);
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
