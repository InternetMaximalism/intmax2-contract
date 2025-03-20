// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IWithdrawal} from "./IWithdrawal.sol";
import {IPlonkVerifier} from "../common/IPlonkVerifier.sol";
import {ILiquidity} from "../liquidity/ILiquidity.sol";
import {IRollup} from "../rollup/IRollup.sol";
import {IContribution} from "../contribution/IContribution.sol";
import {IL2ScrollMessenger} from "@scroll-tech/contracts/L2/IL2ScrollMessenger.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {WithdrawalProofPublicInputsLib} from "./lib/WithdrawalProofPublicInputsLib.sol";
import {ChainedWithdrawalLib} from "./lib/ChainedWithdrawalLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {Byte32Lib} from "../common/Byte32Lib.sol";

contract Withdrawal is IWithdrawal, UUPSUpgradeable, OwnableUpgradeable {
	using EnumerableSet for EnumerableSet.UintSet;
	using WithdrawalLib for WithdrawalLib.Withdrawal;
	using ChainedWithdrawalLib for ChainedWithdrawalLib.ChainedWithdrawal[];
	using WithdrawalProofPublicInputsLib for WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs;
	using Byte32Lib for bytes32;

	/// @notice withdrawal verifier contract
	IPlonkVerifier private withdrawalVerifier;
	IRollup private rollup;

	/// @notice liquidity contract address
	address private liquidity;

	/// @notice direct withdrawal token indices
	IContribution private contribution;

	/// @notice nullifiers
	mapping(bytes32 => bool) private nullifiers;

	/// @notice direct withdrawal token indices
	EnumerableSet.UintSet internal directWithdrawalTokenIndices;

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize(
		address _admin,
		address _withdrawalVerifier,
		address _liquidity,
		address _rollup,
		address _contribution,
		uint256[] memory _directWithdrawalTokenIndices
	) external initializer {
		if (_admin == address(0)) {
			revert AddressZero();
		}
		if (_withdrawalVerifier == address(0)) {
			revert AddressZero();
		}
		if (_liquidity == address(0)) {
			revert AddressZero();
		}
		if (_rollup == address(0)) {
			revert AddressZero();
		}
		if (_contribution == address(0)) {
			revert AddressZero();
		}
		__Ownable_init(_admin);
		__UUPSUpgradeable_init();
		withdrawalVerifier = IPlonkVerifier(_withdrawalVerifier);
		rollup = IRollup(_rollup);
		contribution = IContribution(_contribution);
		liquidity = _liquidity;
		innerAddDirectWithdrawalTokenIndices(_directWithdrawalTokenIndices);
	}

	function submitWithdrawalProof(
		ChainedWithdrawalLib.ChainedWithdrawal[] calldata withdrawals,
		WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs
			calldata publicInputs,
		bytes calldata proof
	) external {
		_validateWithdrawalProof(withdrawals, publicInputs, proof);
		uint256 directWithdrawalCounter = 0;
		uint256 claimableWithdrawalCounter = 0;
		bool[] memory isSkippedFlags = new bool[](withdrawals.length);
		for (uint256 i = 0; i < withdrawals.length; i++) {
			ChainedWithdrawalLib.ChainedWithdrawal
				memory chainedWithdrawal = withdrawals[i];
			if (nullifiers[chainedWithdrawal.nullifier]) {
				isSkippedFlags[i] = true;
				continue; // already withdrawn
			}
			nullifiers[chainedWithdrawal.nullifier] = true;
			bytes32 expectedBlockHash = rollup.getBlockHash(
				chainedWithdrawal.blockNumber
			);
			if (expectedBlockHash != chainedWithdrawal.blockHash) {
				revert BlockHashNotExists(chainedWithdrawal.blockHash);
			}
			if (_isDirectWithdrawalToken(chainedWithdrawal.tokenIndex)) {
				directWithdrawalCounter++;
			} else {
				claimableWithdrawalCounter++;
			}
		}
		if (directWithdrawalCounter == 0 && claimableWithdrawalCounter == 0) {
			return;
		}
		WithdrawalLib.Withdrawal[]
			memory directWithdrawals = new WithdrawalLib.Withdrawal[](
				directWithdrawalCounter
			);
		bytes32[] memory claimableWithdrawals = new bytes32[](
			claimableWithdrawalCounter
		);

		uint256 directWithdrawalIndex = 0;
		uint256 claimableWithdrawalIndex = 0;

		for (uint256 i = 0; i < withdrawals.length; i++) {
			if (isSkippedFlags[i]) {
				continue; // skipped withdrawal
			}
			ChainedWithdrawalLib.ChainedWithdrawal
				memory chainedWithdrawal = withdrawals[i];
			WithdrawalLib.Withdrawal memory withdrawal = WithdrawalLib
				.Withdrawal(
					chainedWithdrawal.recipient,
					chainedWithdrawal.tokenIndex,
					chainedWithdrawal.amount,
					chainedWithdrawal.nullifier
				);
			if (_isDirectWithdrawalToken(chainedWithdrawal.tokenIndex)) {
				directWithdrawals[directWithdrawalIndex] = withdrawal;
				emit DirectWithdrawalQueued(
					withdrawal.getHash(),
					withdrawal.recipient,
					withdrawal
				);
				directWithdrawalIndex++;
			} else {
				bytes32 withdrawalHash = withdrawal.getHash();
				claimableWithdrawals[claimableWithdrawalIndex] = withdrawalHash;
				emit ClaimableWithdrawalQueued(
					withdrawalHash,
					withdrawal.recipient,
					withdrawal
				);
				claimableWithdrawalIndex++;
			}
		}

		ILiquidity(liquidity).processWithdrawals(
			directWithdrawals,
			claimableWithdrawals
		);

		contribution.recordContribution(
			keccak256("WITHDRAWAL"),
			_msgSender(),
			directWithdrawalCounter + claimableWithdrawalCounter
		);
	}

	function _isDirectWithdrawalToken(
		uint32 tokenIndex
	) private view returns (bool) {
		return directWithdrawalTokenIndices.contains(tokenIndex);
	}

	function _validateWithdrawalProof(
		ChainedWithdrawalLib.ChainedWithdrawal[] calldata withdrawals,
		WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs
			calldata publicInputs,
		bytes calldata proof
	) private view {
		if (
			!withdrawals.verifyWithdrawalChain(publicInputs.lastWithdrawalHash)
		) {
			revert WithdrawalChainVerificationFailed();
		}
		if (publicInputs.withdrawalAggregator != _msgSender()) {
			revert WithdrawalAggregatorMismatch();
		}
		if (!withdrawalVerifier.Verify(proof, publicInputs.getHash().split())) {
			revert WithdrawalProofVerificationFailed();
		}
	}

	function getDirectWithdrawalTokenIndices()
		external
		view
		returns (uint256[] memory)
	{
		return directWithdrawalTokenIndices.values();
	}

	function addDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external onlyOwner {
		innerAddDirectWithdrawalTokenIndices(tokenIndices);
	}

	function innerAddDirectWithdrawalTokenIndices(
		uint256[] memory tokenIndices
	) private {
		for (uint256 i = 0; i < tokenIndices.length; i++) {
			bool result = directWithdrawalTokenIndices.add(tokenIndices[i]);
			if (!result) {
				revert TokenAlreadyExist(tokenIndices[i]);
			}
		}
		emit DirectWithdrawalTokenIndicesAdded(tokenIndices);
	}

	function removeDirectWithdrawalTokenIndices(
		uint256[] calldata tokenIndices
	) external onlyOwner {
		for (uint256 i = 0; i < tokenIndices.length; i++) {
			bool result = directWithdrawalTokenIndices.remove(tokenIndices[i]);
			if (!result) {
				revert TokenNotExist(tokenIndices[i]);
			}
		}
		emit DirectWithdrawalTokenIndicesRemoved(tokenIndices);
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
