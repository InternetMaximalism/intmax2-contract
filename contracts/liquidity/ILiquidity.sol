// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {DepositLib} from "../common/DepositLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {DepositQueueLib} from "./lib/DepositQueueLib.sol";

/**
 * @title Liquidity Interface
 * @notice Interface for the Liquidity contract that manages deposits and withdrawals of various token types
 * between Layer 1 and Layer 2 in the Intmax2 protocol
 */
interface ILiquidity {
	/// @notice address is zero address
	error AddressZero();

	/// @notice Error thrown when someone other than the original depositor tries to cancel a deposit
	error OnlySenderCanCancelDeposit();

	/// @notice Error thrown when the provided deposit hash doesn't match the calculated hash during cancellation
	/// @param depositDataHash The hash from the deposit data
	/// @param calculatedHash The hash calculated from given input
	error InvalidDepositHash(bytes32 depositDataHash, bytes32 calculatedHash);

	/// @notice Error thrown when the sender is not the Scroll Messenger in onlyWithdrawal context
	error SenderIsNotScrollMessenger();

	/// @notice Error thrown when the withdrawal contract address is not set
	error WithdrawalAddressNotSet();

	/// @notice Error thrown when the xDomainMessageSender of the Scroll Messenger doesn't match the withdrawal contract address
	error InvalidWithdrawalAddress();

	/// @notice Error thrown when trying to claim a non-existent withdrawal
	/// @param withdrawalHash The hash of the withdrawal that wasn't found
	error WithdrawalNotFound(bytes32 withdrawalHash);

	/// @notice Error thrown when trying to deposit zero amount of native/ERC20/ERC1155 tokens
	error TriedToDepositZero();

	/// @notice Error thrown when already relayed deposits
	error AlreadyRelayed();

	/// @notice Error thrown when the deposit hash already exists
	/// @dev Used to prevent duplicate deposits with the same parameters
	error DepositHashAlreadyExists(bytes32 depositHash);

	/// @notice Error thrown when the deposit amount exceeds the limit
	/// @param depositAmount The amount that was attempted to be deposited
	/// @param limit The maximum allowed deposit amount
	error DepositAmountExceedsLimit(uint256 depositAmount, uint256 limit);

	/// @notice Error thrown when AML validation fails
	error AmlValidationFailed();

	/// @notice Error thrown when eligibility validation fails
	error EligibilityValidationFailed();

	/// @notice Error thrown when the admin tries to set fee more than WITHDRAWAL_FEE_RATIO_LIMIT
	error WithdrawalFeeRatioExceedsLimit();

	/// @notice Event emitted when a deposit is made
	/// @param depositId The unique identifier for the deposit
	/// @param sender The address that made the deposit
	/// @param recipientSaltHash The hash of the recipient's intmax2 address (BLS public key) and a secret salt
	/// @param tokenIndex The index of the token being deposited
	/// @param amount The amount of tokens deposited
	/// @param isEligible if true, the deposit is eligible
	/// @param depositedAt The timestamp of the deposit
	event Deposited(
		uint256 indexed depositId,
		address indexed sender,
		bytes32 indexed recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount,
		bool isEligible,
		uint256 depositedAt
	);

	/// @notice Event emitted when deposits are relayed
	/// @param upToDepositId The highest deposit ID that was relayed
	/// @param gasLimit The gas limit for the L2 transaction
	/// @param message Additional message data
	event DepositsRelayed(
		uint256 indexed upToDepositId,
		uint256 gasLimit,
		bytes message
	);

	/// @notice Event emitted when a deposit is canceled
	/// @param depositId The ID of the canceled deposit
	event DepositCanceled(uint256 indexed depositId);

	/// @notice Event emitted when a withdrawal becomes claimable
	/// @param withdrawalHash The hash of the claimable withdrawal
	event WithdrawalClaimable(bytes32 indexed withdrawalHash);

	/// @notice Event emitted when a direct withdrawal succeeds
	/// @param withdrawalHash The hash of the successful withdrawal
	/// @param recipient The address that received the withdrawal
	event DirectWithdrawalSuccessed(
		bytes32 indexed withdrawalHash,
		address indexed recipient
	);

	/// @notice Event emitted when a direct withdrawal fails, and the funds become claimable
	/// @param withdrawalHash The hash of the failed withdrawal
	/// @param withdrawal The withdrawal data
	event DirectWithdrawalFailed(
		bytes32 indexed withdrawalHash,
		WithdrawalLib.Withdrawal withdrawal
	);

	/// @notice Event emitted when a withdrawal is claimed
	/// @param recipient The address that claimed the withdrawal
	/// @param withdrawalHash The hash of the claimed withdrawal
	event ClaimedWithdrawal(
		address indexed recipient,
		bytes32 indexed withdrawalHash
	);

	/// @notice Event emitted when withdrawal fee is collected
	/// @param token The index of the token
	/// @param amount The amount of tokens collected
	event WithdrawalFeeCollected(uint32 indexed token, uint256 amount);

	/// @notice Event emitted when withdrawal fees are withdrawn
	/// @param recipient The address that received the fees
	/// @param token The index of the token
	/// @param amount The amount of tokens withdrawn
	event WithdrawalFeeWithdrawn(
		address indexed recipient,
		uint32 indexed token,
		uint256 amount
	);

	/// @notice Event emitted when permitter addresses are set
	/// @param amlPermitter The address of the AML permitter contract
	/// @param eligibilityPermitter The address of the eligibility permitter contract
	event PermitterSet(
		address indexed amlPermitter,
		address indexed eligibilityPermitter
	);

	/// @notice Event emitted when the withdrawal fee ratio is set
	/// @param tokenIndex The index of the token
	/// @param feeRatio The withdrawal fee ratio for the token (in basis points)
	event WithdrawalFeeRatioSet(uint32 indexed tokenIndex, uint256 feeRatio);

	/**
	 * @notice Pauses all deposit operations
	 * @dev Only callable by the admin role
	 */
	function pauseDeposits() external;

	/**
	 * @notice Unpauses all deposit operations
	 * @dev Only callable by the admin role
	 */
	function unpauseDeposits() external;

	/**
	 * @notice Sets the AML and eligibility permitter contract addresses
	 * @dev Only callable by the admin role
	 * @param _amlPermitter The address of the AML permitter contract
	 * @param _eligibilityPermitter The address of the eligibility permitter contract
	 */
	function setPermitter(
		address _amlPermitter,
		address _eligibilityPermitter
	) external;

	/**
	 * @notice Sets the withdrawal fee ratio for a specific token
	 * @dev Only callable by the admin role. Fee ratio is in basis points (1bp = 0.01%)
	 * @param tokenIndex The index of the token to set the fee ratio for
	 * @param feeRatio The fee ratio to set (in basis points, max 1500 = 15%)
	 */
	function setWithdrawalFeeRatio(
		uint32 tokenIndex,
		uint256 feeRatio
	) external;

	/**
	 * @notice Withdraws collected fees for specified tokens to a recipient address
	 * @dev Only callable by the admin role. Skips tokens with zero fees
	 * @param recipient The address to receive the withdrawn fees
	 * @param tokenIndices Array of token indices to withdraw fees for
	 */
	function withdrawCollectedFees(
		address recipient,
		uint32[] calldata tokenIndices
	) external;

	/**
	 * @notice Deposit native token (ETH) to Intmax
	 * @dev The deposit amount is taken from msg.value, recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt
	 * @param recipientSaltHash The hash of the recipient's intmax2 address and a secret salt
	 * @param amlPermission The data to verify AML check
	 * @param eligibilityPermission The data to verify eligibility check
	 */
	function depositNativeToken(
		bytes32 recipientSaltHash,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external payable;

	/**
	 * @notice Deposit a specified amount of ERC20 token to Intmax
	 * @dev Requires prior approval for this contract to spend the tokens
	 * @dev recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt
	 * @param tokenAddress The address of the ERC20 token contract
	 * @param recipientSaltHash The hash of the recipient's address and a secret salt
	 * @param amount The amount of tokens to deposit
	 * @param amlPermission The data to verify AML check
	 * @param eligibilityPermission The data to verify eligibility check
	 */
	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external;

	/**
	 * @notice Deposit an ERC721 token to Intmax
	 * @dev Requires prior approval for this contract to transfer the token
	 * @param tokenAddress The address of the ERC721 token contract
	 * @param recipientSaltHash The hash of the recipient's address and a secret salt
	 * @param tokenId The ID of the token to deposit
	 * @param amlPermission The data to verify AML check
	 * @param eligibilityPermission The data to verify eligibility check
	 */
	function depositERC721(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external;

	/**
	 * @notice Deposit a specified amount of ERC1155 tokens to Intmax
	 * @dev Requires prior approval for this contract to transfer the tokens
	 * @param tokenAddress The address of the ERC1155 token contract
	 * @param recipientSaltHash The hash of the recipient's address and a secret salt
	 * @param tokenId The ID of the token to deposit
	 * @param amount The amount of tokens to deposit
	 * @param amlPermission The data to verify AML check
	 * @param eligibilityPermission The data to verify eligibility check
	 */
	function depositERC1155(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		uint256 amount,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external;

	/**
	 * @notice Relays deposits from Layer 1 to Intmax
	 * @dev Only callable by addresses with the RELAYER role. The msg.value is used to pay for the L2 gas
	 * @param upToDepositId The upper limit of the Deposit ID that will be relayed
	 * @param gasLimit The gas limit for the L2 transaction
	 */
	function relayDeposits(
		uint256 upToDepositId,
		uint256 gasLimit
	) external payable;

	/**
	 * @notice Cancels a deposit that hasn't been relayed yet
	 * @dev Only the original sender can cancel their deposit, and only if it hasn't been relayed
	 * @param depositId The ID of the deposit to cancel
	 * @param deposit The deposit data structure containing the original deposit details
	 */
	function cancelDeposit(
		uint256 depositId,
		DepositLib.Deposit calldata deposit
	) external;

	/**
	 * @notice Processes withdrawals from Layer 2 to Layer 1
	 * @dev Only callable by addresses with the WITHDRAWAL role through the L1ScrollMessenger
	 * @param withdrawals Array of direct withdrawals to process immediately
	 * @param withdrawalHashes Array of withdrawal hashes to mark as claimable (for non-direct withdrawals)
	 */
	function processWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals,
		bytes32[] calldata withdrawalHashes
	) external;

	/**
	 * @notice Get the ID of the last deposit relayed to Layer 2
	 * @dev This ID represents the highest deposit that has been successfully relayed
	 * @return The ID of the last relayed deposit
	 */
	function getLastRelayedDepositId() external view returns (uint256);

	/**
	 * @notice Get the ID of the last deposit made to Layer 2
	 * @dev This ID represents the highest deposit that has been created, whether relayed or not
	 * @return The ID of the last deposit
	 */
	function getLastDepositId() external view returns (uint256);

	/**
	 * @notice Get deposit data for a given deposit ID
	 * @param depositId The ID of the deposit to query
	 * @return The deposit data structure containing sender and deposit hash
	 */
	function getDepositData(
		uint256 depositId
	) external view returns (DepositQueueLib.DepositData memory);

	/**
	 * @notice Get deposit data for multiple deposit IDs in a single call
	 * @param depositIds Array of deposit IDs to query
	 * @return Array of deposit data structures corresponding to the requested IDs
	 */
	function getDepositDataBatch(
		uint256[] memory depositIds
	) external view returns (DepositQueueLib.DepositData[] memory);

	/**
	 * @notice Get the deposit hash for a given deposit ID
	 * @param depositId The ID of the deposit to query
	 * @return The hash of the deposit data
	 */
	function getDepositDataHash(
		uint256 depositId
	) external view returns (bytes32);

	/**
	 * @notice Claim withdrawals for tokens that couldn't be processed through direct withdrawals
	 * @dev Used for ERC721, ERC1155, or failed direct withdrawals of native/ERC20 tokens
	 * @param withdrawals Array of withdrawals to claim
	 */
	function claimWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external;

	/**
	 * @notice Check if a deposit is valid by comparing its parameters with stored data
	 * @param depositId The ID of the deposit to validate
	 * @param recipientSaltHash The hash of the recipient's intmax2 address and a secret salt
	 * @param tokenIndex The index of the token being deposited
	 * @param amount The amount of tokens deposited
	 * @param isEligible Whether the deposit is eligible for mining rewards
	 * @param sender The address that made the deposit
	 * @return True if the deposit is valid, false otherwise
	 */
	function isDepositValid(
		uint256 depositId,
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount,
		bool isEligible,
		address sender
	) external view returns (bool);

	/**
	 * @notice ERC1155 token receiver function required for this contract to receive ERC1155 tokens
	 * @dev Implements the IERC1155Receiver interface
	 * @return bytes4 The function selector to indicate support for ERC1155 token receiving
	 */
	function onERC1155Received(
		address,
		address,
		uint256,
		uint256,
		bytes calldata
	) external pure returns (bytes4);
}
