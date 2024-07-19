// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {DepositLib} from "../common/DepositLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";

interface ILiquidity {
	error InvalidDepositId();
	error OnlyRecipientCanCancelDeposit();
	error InvalidDepositHash();
	error OnlyRecipientCanClaimRejectedDeposit();
	error InvalidLastProcessedDepositId();
	error RollupContractNotSet();
	error SenderIsNotScrollMessenger();
	error InvalidRollup();
	error WithdrawalNotFound();
	error InvalidRecipientSaltHash();
	error InvalidAmount();

	struct DepositData {
		bytes32 depositHash;
		address sender;
	}

	struct Withdrawal {
		address recipient;
		uint32 tokenIndex;
		uint256 amount;
	}

	event Deposited(
		uint256 indexed depositId,
		address indexed sender,
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount,
		uint256 requestedAt
	);

	event DepositCanceled(uint256 indexed depositId);

	event DepositsRejected(uint256 indexed lastAnalyzedDepositId);

	event DepositsSubmitted(uint256 indexed lastProcessedDepositId);

	event WithdrawalClaimable(bytes32 indexed withdrawalHash);

	function depositETH(bytes32 recipientSaltHash) external payable;

	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount
	) external;

	function depositERC721(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId
	) external;

	function depositERC1155(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		uint256 amount
	) external;

	function cancelPendingDeposit(
		uint256 depositId,
		DepositLib.Deposit memory deposit
	) external;

	function claimRejectedDeposit(
		uint256 depositId,
		DepositLib.Deposit memory deposit
	) external;

	/**
	 * @param lastAnalyzedDepositId The last deposit ID that was analyzed
	 * @param rejectedDepositIds The list of deposit IDs that were rejected
	 */
	function rejectDeposits(
		uint256 lastAnalyzedDepositId,
		uint256[] calldata rejectedDepositIds
	) external;

	/**
	 * @notice Submit the deposit root
	 */
	function submitDeposits(uint256 lastProcessedDepositId) external payable;

	/**
	 * @notice Process the withdrawals.
	 * @dev This method is called by the Rollup contract via Scroll Messenger.
	 * @param withdrawals The list of withdrawals to process
	 */
	function processDirectWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external;

	function processClaimableWithdrawals(
		bytes32[] calldata withdrawalHahes
	) external;

	function claimWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external;
}
