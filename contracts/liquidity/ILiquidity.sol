// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {DepositLib} from "../common/DepositLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";

interface ILiquidity {
	error OnlyRecipientCanCancelDeposit();
	error InvalidDepositHash(bytes32 depositDataHash, bytes32 calculatedHash);
	error SenderIsNotScrollMessenger();
	error WithdrawalAddressNotSet();
	error InvalidWithdrawalAddress();
	error WithdrawalNotFound(bytes32 withdrawalHash);
	error InvalidAmount();
	error InvalidValue();

	event Deposited(
		uint256 indexed depositId,
		address indexed sender,
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount,
		uint256 requestedAt
	);

	event DepositsAnalyzed(
		uint256 indexed lastAnalyzedDepositId,
		uint256[] rejectedIndices
	);

	event DepositCanceled(uint256 indexed depositId);

	event DepositsRelayed(
		uint256 indexed lastRelayedDepositId,
		uint256 gasLimit,
		bytes message
	);

	event DepositsReplayed(
		uint32 newGasLimit,
		uint256 messageNonce,
		bytes message
	);

	event WithdrawalClaimable(bytes32 indexed withdrawalHash);

	event DirectWithdrawalsProcessed(
		uint256 indexed lastProcessedDirectWithdrawalId
	);

	event ClaimableWithdrawalsProcessed(
		uint256 indexed lastProcessedClaimableWithdrawalId
	);

	/// @notice Allows users to deposit Ether
	/// @dev The deposit amount should be sent as msg.value
	/// @param recipientSaltHash A Poseidon hash commitment of the INTMAX address with salt
	function depositETH(bytes32 recipientSaltHash) external payable;

	/// @notice Allows users to deposit ERC20 tokens
	/// @param tokenAddress The address of the ERC20 token contract
	/// @param recipientSaltHash A Poseidon hash commitment of the INTMAX address with salt
	/// @param amount The amount of tokens the user wants to deposit
	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount
	) external;

	/// @notice Allows users to deposit ERC721 tokens
	/// @param tokenAddress The address of the ERC721 token contract
	/// @param recipientSaltHash A Poseidon hash commitment of the INTMAX address with salt
	/// @param tokenId The ID of the token the user wants to deposit
	function depositERC721(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId
	) external;

	/// @notice Allows users to cancel their own deposits and get their funds back
	/// @dev This function is used in two scenarios:
	///      1. To cancel deposits that have been rejected
	///      2. To cancel deposits that are stuck due to analyzer node inactivity, even if not rejected
	/// @param depositId The unique identifier of the deposit to be cancelled
	/// @param deposit The deposit structure containing all relevant information
	function cancelDeposit(
		uint256 depositId,
		DepositLib.Deposit memory deposit
	) external;

	/// @notice Allows users to claim their own withdrawals
	/// @dev The contract stores hashes of claimable withdrawals. The claim is successful if the provided withdrawal hash matches a stored hash.
	/// @param withdrawals An array of Withdrawal structures to be claimed
	function claimWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external;

	/// @notice Trusted nodes submit the IDs of deposits that do not meet AML standards by this method.
	/// @dev upToDepositId specifies the last deposit id that have been analyzed. It must be greater than lastAnalyzedDeposit and less than or equal to the latest Deposit ID.
	/// @dev rejectDepositIndices must be greater than lastAnalyzedDeposit and less than or equal to upToDepositId.
	/// @param upToDepositId The upper limit of the Deposit ID that has been analyzed. It must be greater than lastAnalyzedDeposit and less than or equal to the latest Deposit ID.
	/// @param rejectDepositIndices An array of indices of deposits to exclude. These indices must be greater than lastAnalyzedDeposit and less than or equal to upToDepositId.
	function analyzeDeposits(
		uint256 upToDepositId,
		uint256[] memory rejectDepositIndices
	) external;

	/**
	 * @notice Relays deposits that have already been analyzed.
	 * @dev The `gasLimit` must be set according to the number of deposits. If the gas limit is too low, the L2 Rollup may not be able to execute.
	 * @dev The messaging fee calculated from the `gasLimit` must be sent as `msg.value`. Any excess amount will be refunded to the caller.
	 *      However, if the `gasLimit` is set higher than the actual gas consumed, the excess messaging fee will still be charged. There will be no refund for the unused gas.
	 * @dev Note: If the transaction fails on the L2 Rollup due to insufficient gas, it can be retried using `replayDeposits`.
	 * @param upToDepositId The ID of the last deposit to be relayed.
	 * @param gasLimit The gas limit for the transaction.
	 */
	function relayDeposits(
		uint256 upToDepositId,
		uint256 gasLimit
	) external payable;

	/*****************************
	 * Public System Functions *
	 *****************************/

	/// @notice Process both direct withdrawals and claimable withdrawals in a single transaction
	/// @dev This function is called by the L2 Withdrawal contract via the L1 Scroll Messenger
	/// @param lastProcessedDirectWithdrawalId The ID of the last processed direct withdrawal
	/// @param withdrawals An array of Withdrawal structures for direct processing
	/// @param lastProcessedClaimableWithdrawalId The ID of the last processed claimable withdrawal
	/// @param withdrawalHahes An array of hashes for claimable withdrawals
	function processWithdrawals(
		uint256 lastProcessedDirectWithdrawalId,
		WithdrawalLib.Withdrawal[] calldata withdrawals,
		uint256 lastProcessedClaimableWithdrawalId,
		bytes32[] calldata withdrawalHahes
	) external;

	/// @notice Process direct withdrawals by sending funds directly to users' wallets
	/// @dev This function is called by the L2 Withdrawal contract via the L1 Scroll Messenger
	/// @param lastProcessedDirectWithdrawalId The ID of the last processed direct withdrawal
	/// @param withdrawals An array of Withdrawal structures to be processed
	function processDirectWithdrawals(
		uint256 lastProcessedDirectWithdrawalId,
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external;

	/// @notice Process claimable withdrawals by storing withdrawal hashes in storage
	/// @dev This function is called by the L2 Withdrawal contract via the L1 Scroll Messenger
	/// @dev Users need to call claimWithdrawals manually to complete the withdrawal process
	/// @param lastProcessedClaimableWithdrawalId The ID of the last processed claimable withdrawal
	/// @param withdrawalHahes An array of hashes for claimable withdrawals to be stored
	function processClaimableWithdrawals(
		uint256 lastProcessedClaimableWithdrawalId,
		bytes32[] calldata withdrawalHahes
	) external;
}
