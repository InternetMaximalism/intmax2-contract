// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

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

	function unstake() external isStaking {
		// Check if the last block submission is not within 24 hour.
		BlockBuilderInfo memory info = blockBuilders[_msgSender()];
		if (!info.hasChallengeDurationPassed()) {
			revert CannotUnstakeWithinChallengeDuration();
		}
		string memory url = info.blockBuilderUrl;
		uint256 stakeAmount = info.stakeAmount;

		// Remove the block builder information.
		delete blockBuilders[_msgSender()];
		// Return the stake amount to the block builder.
		payable(_msgSender()).transfer(stakeAmount);

		emit BlockBuilderUpdated(_msgSender(), url, stakeAmount);
	}

	// add onlyOwner for dummy zkp verification
	function submitBlockFraudProof(
		FraudProofPublicInputsLib.FraudProofPublicInputs calldata publicInputs,
		bytes calldata proof
	) external onlyOwner {
		bytes32 blockHash = rollup.getBlockHash(publicInputs.blockNumber);
		address builder = rollup.getBlockBuilder(publicInputs.blockNumber);

		if (publicInputs.blockHash != blockHash) {
			revert FraudProofBlockHashMismatch({
				given: publicInputs.blockHash,
				expected: blockHash
			});
		}
		if (publicInputs.challenger != _msgSender()) {
			revert FraudProofChallengerMismatch();
		}
		if (slashedBlockNumbers[publicInputs.blockNumber]) {
			revert FraudProofAlreadySubmitted();
		}
		if (!fraudVerifier.Verify(proof, publicInputs.getHash().split())) {
			revert FraudProofVerificationFailed();
		}
		slashedBlockNumbers[publicInputs.blockNumber] = true;
		_slashBlockBuilder(builder, _msgSender());

		emit BlockFraudProofSubmitted(
			publicInputs.blockNumber,
			builder,
			_msgSender()
		);
	}

	function _slashBlockBuilder(address blockBuilder, address _owner) private {
		BlockBuilderInfo memory info = blockBuilders[blockBuilder];
		if (!info.isStaking()) {
			revert BlockBuilderNotFound();
		}
		info.numSlashes += 1;
		if (!info.isStakeAmountSufficient() && info.isValid) {
			info.isValid = false;
		}
		emit BlockBuilderSlashed(blockBuilder, _owner);
		if (info.stakeAmount < MIN_STAKE_AMOUNT) {
			// A Block Builder may end up in this situation if, for example, they initially staked 0.15 ETH and posted two invalid blocks.
			// After the first slashing, their stake would be reduced to 0.05 ETH. If they post another invalid block and are slashed again,
			// this condition will be triggered, leaving their stake below the required minimum.
			uint256 slashAmount = info.stakeAmount;
			info.stakeAmount = 0;
			blockBuilders[blockBuilder] = info;
			if (slashAmount < MIN_STAKE_AMOUNT / 2) {
				payable(_owner).transfer(slashAmount);
			} else {
				payable(_owner).transfer(MIN_STAKE_AMOUNT / 2);
				payable(burnAddress).transfer(
					slashAmount - (MIN_STAKE_AMOUNT / 2)
				);
			}
			return;
		}
		info.stakeAmount -= MIN_STAKE_AMOUNT;
		// solhint-disable-next-line reentrancy
		blockBuilders[blockBuilder] = info;

		// NOTE: A half of the stake lost by the Block Builder will be burned.
		// This is to prevent the Block Builder from generating invalid blocks and
		// submitting fraud proofs by oneself, which would place a burden on
		// the generation of block validity proofs. An invalid block must prove
		// in the block validity proof that it has been invalidated.
		payable(_owner).transfer(MIN_STAKE_AMOUNT / 2);
		payable(burnAddress).transfer(MIN_STAKE_AMOUNT / 2);
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
