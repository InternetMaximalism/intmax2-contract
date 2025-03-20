// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IClaim} from "./IClaim.sol";
import {IPlonkVerifier} from "../common/IPlonkVerifier.sol";
import {ILiquidity} from "../liquidity/ILiquidity.sol";
import {IRollup} from "../rollup/IRollup.sol";
import {IContribution} from "../contribution/IContribution.sol";
import {IL2ScrollMessenger} from "@scroll-tech/contracts/L2/IL2ScrollMessenger.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {ClaimProofPublicInputsLib} from "./lib/ClaimProofPublicInputsLib.sol";
import {ChainedClaimLib} from "./lib/ChainedClaimLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {Byte32Lib} from "../common/Byte32Lib.sol";
import {AllocationLib} from "./lib/AllocationLib.sol";

contract Claim is IClaim, UUPSUpgradeable, OwnableUpgradeable {
	using WithdrawalLib for WithdrawalLib.Withdrawal;
	using ChainedClaimLib for ChainedClaimLib.ChainedClaim[];
	using ClaimProofPublicInputsLib for ClaimProofPublicInputsLib.ClaimProofPublicInputs;
	using Byte32Lib for bytes32;
	using AllocationLib for AllocationLib.State;

	/// @notice verifies the claim proof
	IPlonkVerifier private claimVerifier;

	/// @notice ScrollMessenger contract
	IL2ScrollMessenger private l2ScrollMessenger;

	/// @notice Rollup contract
	IRollup private rollup;

	/// @notice Liquidity contract
	address private liquidity;

	/// @notice Contribution contract
	IContribution private contribution;

	/// @notice Nonce to make nullifier unique
	uint256 private nullifierNonce;

	/// @notice allocation state
	AllocationLib.State private allocationState;

	/// @notice nullifiers
	mapping(bytes32 => bool) private nullifiers;

	uint32 private constant REWARD_TOKEN_INDEX = 1;

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize(
		address _admin,
		address _scrollMessenger,
		address _claimVerifier,
		address _liquidity,
		address _rollup,
		address _contribution,
		uint256 periodInterval
	) external initializer {
		if (
			_admin == address(0) ||
			_scrollMessenger == address(0) ||
			_claimVerifier == address(0) ||
			_liquidity == address(0) ||
			_rollup == address(0) ||
			_contribution == address(0)
		) {
			revert AddressZero();
		}
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
		AllocationLib.initialize(allocationState, periodInterval);
		l2ScrollMessenger = IL2ScrollMessenger(_scrollMessenger);
		claimVerifier = IPlonkVerifier(_claimVerifier);
		rollup = IRollup(_rollup);
		contribution = IContribution(_contribution);
		liquidity = _liquidity;
	}

	function submitClaimProof(
		ChainedClaimLib.ChainedClaim[] calldata claims,
		ClaimProofPublicInputsLib.ClaimProofPublicInputs calldata publicInputs,
		bytes calldata proof
	) external {
		_validateClaimProof(claims, publicInputs, proof);
		uint256 counter = 0;
		for (uint256 i = 0; i < claims.length; i++) {
			ChainedClaimLib.ChainedClaim memory chainedClaim = claims[i];
			if (nullifiers[chainedClaim.nullifier]) {
				continue; // already withdrawn
			}
			nullifiers[chainedClaim.nullifier] = true;
			bytes32 expectedBlockHash = rollup.getBlockHash(
				chainedClaim.blockNumber
			);
			if (expectedBlockHash != chainedClaim.blockHash) {
				revert BlockHashNotExists(chainedClaim.blockHash);
			}
			// record contribution
			allocationState.recordContribution(
				chainedClaim.recipient,
				chainedClaim.amount
			);
			counter++;
		}
		contribution.recordContribution(
			keccak256("CLAIM"),
			_msgSender(),
			counter
		);
	}

	function relayClaims(uint256 period, address[] calldata users) external {
		if (allocationState.getCurrentPeriod() <= period) {
			revert AllocationLib.NotFinishedPeriod();
		}

		WithdrawalLib.Withdrawal[]
			memory directWithdrawals = new WithdrawalLib.Withdrawal[](
				users.length
			);
		uint256 nullifierNonceCached = nullifierNonce;
		for (uint256 i = 0; i < directWithdrawals.length; i++) {
			address user = users[i];
			uint256 allocation = allocationState.consumeUserAllocation(
				period,
				user
			);
			// nullifier can be any unique value
			// only used for direct withdrawal compatibility
			// uniqueness prevents overwriting an existing claimable withdrawal
			// when direct withdrawals fail
			bytes32 nullifier = keccak256(
				abi.encodePacked("claim", nullifierNonceCached)
			);
			nullifierNonceCached++;
			WithdrawalLib.Withdrawal memory withdrawal = WithdrawalLib
				.Withdrawal(user, REWARD_TOKEN_INDEX, allocation, nullifier);
			emit DirectWithdrawalQueued(
				withdrawal.getHash(),
				withdrawal.recipient,
				withdrawal
			);
			directWithdrawals[i] = withdrawal;
		}
		nullifierNonce = nullifierNonceCached;
		bytes memory message = abi.encodeWithSelector(
			ILiquidity.processWithdrawals.selector,
			directWithdrawals,
			new bytes32[](0)
		);
		_relayMessage(message);

		contribution.recordContribution(
			keccak256("RELAY_CLAIM"),
			_msgSender(),
			users.length
		);
	}

	function _relayMessage(bytes memory message) private {
		uint256 value = 0; // relay to non-payable function
		// In the current implementation of ScrollMessenger, the `gasLimit` is simply included in the L2 event log
		// and does not impose any restrictions on the L1 gas limit. However, considering the possibility of
		// future implementation changes, we will specify a maximum value.
		uint256 gasLimit = type(uint256).max;
		l2ScrollMessenger.sendMessage{value: value}(
			liquidity,
			value,
			message,
			gasLimit,
			_msgSender()
		);
	}

	function _validateClaimProof(
		ChainedClaimLib.ChainedClaim[] calldata claims,
		ClaimProofPublicInputsLib.ClaimProofPublicInputs calldata publicInputs,
		bytes calldata proof
	) private view {
		if (!claims.verifyClaimChain(publicInputs.lastClaimHash)) {
			revert ClaimChainVerificationFailed();
		}
		if (publicInputs.claimAggregator != _msgSender()) {
			revert ClaimAggregatorMismatch();
		}
		if (!claimVerifier.Verify(proof, publicInputs.getHash().split())) {
			revert ClaimProofVerificationFailed();
		}
	}

	function getCurrentPeriod() external view returns (uint256) {
		return allocationState.getCurrentPeriod();
	}

	function getAllocationInfo(
		uint256 periodNumber,
		address user
	) external view returns (AllocationLib.AllocationInfo memory) {
		return allocationState.getAllocationInfo(periodNumber, user);
	}

	function getAllocationConstants()
		external
		view
		returns (AllocationLib.AllocationConstants memory)
	{
		return allocationState.getAllocationConstants();
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
