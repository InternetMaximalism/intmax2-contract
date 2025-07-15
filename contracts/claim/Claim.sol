// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title Claim
 * @notice Contract for handling claims from intmax2 and distributing rewards
 * @dev This contract verifies claim proofs and manages reward allocations
 */
import {IClaim} from "./IClaim.sol";
import {IPlonkVerifier} from "../common/IPlonkVerifier.sol";
import {ILiquidity} from "../liquidity/ILiquidity.sol";
import {IRollup} from "../rollup/IRollup.sol";
import {IContribution} from "../contribution/IContribution.sol";
import {IL2ScrollMessenger} from "@scroll-tech/contracts/L2/IL2ScrollMessenger.sol";
import {IMigration} from "../common/IMigration.sol";

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {ClaimProofPublicInputsLib} from "./lib/ClaimProofPublicInputsLib.sol";
import {ChainedClaimLib} from "./lib/ChainedClaimLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {Byte32Lib} from "../common/Byte32Lib.sol";
import {AllocationLib} from "./lib/AllocationLib.sol";

contract Claim is IClaim, IMigration, UUPSUpgradeable, OwnableUpgradeable {
	using WithdrawalLib for WithdrawalLib.Withdrawal;
	using ChainedClaimLib for ChainedClaimLib.ChainedClaim[];
	using ClaimProofPublicInputsLib for ClaimProofPublicInputsLib.ClaimProofPublicInputs;
	using Byte32Lib for bytes32;
	using AllocationLib for AllocationLib.State;

	/// @notice Maximum number of claim that can be relayed in a single transaction
	/// @dev This limit prevents situations where too many claims are relayed to L1 simultaneously,
	/// @dev which could exceed the L1 block gas limit and cause transaction failures.
	uint256 public constant RELAY_LIMIT = 100;

	/**
	 * @notice verifies the claim proof
	 */
	IPlonkVerifier public claimVerifier;

	/**
	 * @notice ScrollMessenger contract
	 */
	IL2ScrollMessenger public l2ScrollMessenger;

	/**
	 * @notice Rollup contract
	 */
	IRollup public rollup;

	/**
	 * @notice Liquidity contract
	 */
	address public liquidity;

	/**
	 * @notice Contribution contract
	 */
	IContribution public contribution;

	/**
	 * @notice Nonce to make nullifier unique
	 */
	uint256 public nullifierNonce;

	/**
	 * @notice allocation state
	 */
	AllocationLib.State private allocationState;

	/**
	 * @notice nullifiers
	 */
	mapping(bytes32 => bool) public nullifiers;

	bool public isMigrationCompleted;

	uint32 public constant REWARD_TOKEN_INDEX = 1;

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initializes the Claim contract
	 * @dev Sets up the contract with required dependencies and initializes the allocation state
	 * @param _admin Address of the contract admin
	 * @param _scrollMessenger Address of the Scroll Messenger contract
	 * @param _claimVerifier Address of the claim proof verifier contract
	 * @param _liquidity Address of the Liquidity contract
	 * @param _rollup Address of the Rollup contract
	 * @param _contribution Address of the Contribution contract
	 * @param periodInterval Time interval between allocation periods in seconds
	 */
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

	/**
	 * @notice Updates the claim verifier address
	 * @dev Only the contract owner can update the verifier
	 * @param _claimVerifier Address of the new claim verifier
	 */
	function updateVerifier(address _claimVerifier) external onlyOwner {
		if (_claimVerifier == address(0)) {
			revert AddressZero();
		}
		claimVerifier = IPlonkVerifier(_claimVerifier);
		emit VerifierUpdated(_claimVerifier);
	}

	/**
	 * @notice Submit and verify claim proofs from intmax2
	 * @dev Validates the claim proof, checks block hashes, and records contributions
	 * @param claims Array of chained claims to be processed
	 * @param publicInputs Public inputs for the claim proof verification
	 * @param proof Zero-knowledge proof data
	 */
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

	/**
	 * @notice Relay processed claims to the liquidity contract as withdrawals
	 * @dev Creates withdrawal objects for each user's allocation and sends them to L1
	 * @param period The allocation period to process
	 * @param users Array of user addresses to process allocations for
	 */
	function relayClaims(uint256 period, address[] calldata users) external {
		if (allocationState.getCurrentPeriod() <= period) {
			revert AllocationLib.NotFinishedPeriod();
		}

		WithdrawalLib.Withdrawal[]
			memory tempDirectWithdrawals = new WithdrawalLib.Withdrawal[](
				users.length
			);
		uint256 nullifierNonceCached = nullifierNonce;
		uint256 counter = 0;
		for (uint256 i = 0; i < users.length; i++) {
			address user = users[i];
			uint256 allocation = allocationState.consumeUserAllocation(
				period,
				user
			);
			if (allocation == 0) {
				continue;
			}
			// nullifier can be any unique value
			// only used for direct withdrawal compatibility
			// uniqueness prevents overwriting an existing claimable withdrawal
			// when direct withdrawals fail
			bytes32 nullifier = keccak256(
				abi.encodePacked("claim", nullifierNonceCached + counter)
			);
			WithdrawalLib.Withdrawal memory withdrawal = WithdrawalLib
				.Withdrawal(user, REWARD_TOKEN_INDEX, allocation, nullifier);
			emit DirectWithdrawalQueued(
				withdrawal.getHash(),
				withdrawal.recipient,
				withdrawal
			);
			tempDirectWithdrawals[counter] = withdrawal;
			counter++;
		}
		if (counter == 0) {
			return;
		}
		nullifierNonce = nullifierNonceCached + counter;

		if (counter > RELAY_LIMIT) {
			revert RelayLimitExceeded();
		}

		// cut the array to the actual size
		WithdrawalLib.Withdrawal[]
			memory directWithdrawals = new WithdrawalLib.Withdrawal[](counter);
		for (uint256 i = 0; i < counter; i++) {
			directWithdrawals[i] = tempDirectWithdrawals[i];
		}

		bytes memory message = abi.encodeWithSelector(
			ILiquidity.processWithdrawals.selector,
			directWithdrawals,
			new bytes32[](0)
		);
		_relayMessage(message);

		contribution.recordContribution(
			keccak256("RELAY_CLAIM"),
			_msgSender(),
			counter
		);
	}

	/**
	 * @notice Relays a message to the L1 chain via the Scroll Messenger
	 * @dev Encodes and sends a message to the liquidity contract on L1
	 * @param message The encoded message to be sent to L1
	 */
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

	/**
	 * @notice Validates a claim proof
	 * @dev Verifies the claim chain, checks the aggregator, and validates the ZK proof
	 * @param claims Array of chained claims to validate
	 * @param publicInputs Public inputs for the claim proof
	 * @param proof Zero-knowledge proof data
	 */
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

	/// @inheritdoc IClaim
	function getCurrentPeriod() external view returns (uint256) {
		return allocationState.getCurrentPeriod();
	}

	/// @inheritdoc IClaim
	function getAllocationInfo(
		uint256 periodNumber,
		address user
	) external view returns (AllocationLib.AllocationInfo memory) {
		return allocationState.getAllocationInfo(periodNumber, user);
	}

	/// @inheritdoc IClaim
	function getAllocationConstants()
		external
		view
		returns (AllocationLib.AllocationConstants memory)
	{
		return allocationState.getAllocationConstants();
	}

	function migrateStartTimestamp(uint256 _startTimestamp) external onlyOwner {
		if (isMigrationCompleted) {
			revert AlreadyMigrated();
		}
		allocationState.startTimestamp = _startTimestamp;
	}

	function migrateNullifiers(
		bytes32[] calldata _nullifiers
	) external onlyOwner {
		if (isMigrationCompleted) {
			revert AlreadyMigrated();
		}
		for (uint256 i = 0; i < _nullifiers.length; i++) {
			nullifiers[_nullifiers[i]] = true;
		}
	}

	function migrateContributions(
		uint256[] calldata periodNumbers,
		address[] calldata users,
		uint256[] calldata depositAmounts
	) external onlyOwner {
		if (isMigrationCompleted) {
			revert AlreadyMigrated();
		}
		if (
			periodNumbers.length != users.length ||
			periodNumbers.length != depositAmounts.length
		) {
			revert InvalidInput();
		}
		for (uint256 i = 0; i < periodNumbers.length; i++) {
			uint256 period = periodNumbers[i];
			address user = users[i];
			uint256 depositAmount = depositAmounts[i];
			allocationState.migrateContribution(period, user, depositAmount);
		}
	}

	function migrateConsumeUserAllocation(
		uint256[] calldata periodNumbers,
		address[] calldata users
	) external onlyOwner {
		if (isMigrationCompleted) {
			revert AlreadyMigrated();
		}
		if (periodNumbers.length != users.length) {
			revert InvalidInput();
		}
		for (uint256 i = 0; i < periodNumbers.length; i++) {
			uint256 period = periodNumbers[i];
			address user = users[i];
			allocationState.userContributions[period][user] = 0;
		}
	}

	function finishMigration() external onlyOwner {
		if (isMigrationCompleted) {
			revert AlreadyMigrated();
		}
		isMigrationCompleted = true;
		emit MigrationCompleted();
	}

	/**
	 * @notice Authorizes an upgrade to a new implementation
	 * @dev Only the owner can authorize upgrades
	 * @param newImplementation Address of the new implementation
	 */
	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyOwner {}
}
