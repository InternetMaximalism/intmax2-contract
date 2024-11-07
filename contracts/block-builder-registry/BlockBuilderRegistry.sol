// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IBlockBuilderRegistry} from "./IBlockBuilderRegistry.sol";
import {IPlonkVerifier} from "../common/IPlonkVerifier.sol";
import {IRollup} from "../rollup/IRollup.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {MIN_STAKE_AMOUNT} from "./BlockBuilderRegistryConst.sol";
import {BlockBuilderInfoLib} from "./BlockBuilderInfoLib.sol";
import {FraudProofPublicInputsLib} from "./lib/FraudProofPublicInputsLib.sol";
import {Byte32Lib} from "../common/Byte32Lib.sol";

contract BlockBuilderRegistry is
	OwnableUpgradeable,
	UUPSUpgradeable,
	IBlockBuilderRegistry
{
	IRollup private rollup;
	IPlonkVerifier private fraudVerifier;
	address private burnAddress;
	mapping(address => BlockBuilderInfo) public blockBuilders;
	address[] private blockBuilderAddresses;
	mapping(uint32 => bool) private slashedBlockNumbers;

	using BlockBuilderInfoLib for BlockBuilderInfo;
	using FraudProofPublicInputsLib for FraudProofPublicInputsLib.FraudProofPublicInputs;
	using Byte32Lib for bytes32;

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
	 * @param _rollup The address of the rollup contract.
	 */
	function initialize(
		address _rollup,
		address _fraudVerifier
	) external initializer {
		if (_rollup == address(0)) {
			revert AddressZero();
		}
		if (_fraudVerifier == address(0)) {
			revert AddressZero();
		}
		__Ownable_init(_msgSender());
		__UUPSUpgradeable_init();
		rollup = IRollup(_rollup);
		fraudVerifier = IPlonkVerifier(_fraudVerifier);
		burnAddress = 0x000000000000000000000000000000000000dEaD;
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

	function setBurnAddress(address _burnAddress) external onlyOwner {
		burnAddress = _burnAddress;
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
