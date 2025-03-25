// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {DepositLib} from "../common/DepositLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {DepositQueueLib} from "./lib/DepositQueueLib.sol";

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
	error DepositHashAlreadyExists(bytes32 depositHash);

	/// @notice Error thrown when the deposit amount exceeds the limit
	error DepositAmountExceedsLimit(uint256 depositAmount, uint256 limit);

	/// @notice Error thrown when aml Validation failed
	error AmlValidationFailed();

	/// @notice Error thrown when eligibility Validation failed
	error EligibilityValidationFailed();

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

	/// @notice Event emitted when permitter addresses are set
	/// @param amlPermitter The address of the AML permitter contract
	/// @param eligibilityPermitter The address of the eligibility permitter contract
	event PermitterSet(
		address indexed amlPermitter,
		address indexed eligibilityPermitter
	);

	/// @notice Pause deposits
	function pauseDeposits() external;

	/// @notice Unpause deposits
	function unpauseDeposits() external;

	/// @notice Sets the AML and eligibility permitter addresses
	/// @param _amlPermitter The address of the AML permitter contract
	/// @param _eligibilityPermitter The address of the eligibility permitter contract
	function setPermitter(
		address _amlPermitter,
		address _eligibilityPermitter
	) external;

	/// @notice Deposit native token
	/// @dev recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt
	/// @param recipientSaltHash The hash of the recipient's address and a secret salt
	/// @param amlPermission The data to verify AML check
	/// @param eligibilityPermission The data to verify eligibility check
	function depositNativeToken(
		bytes32 recipientSaltHash,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external payable;

	/// @notice Deposit a specified amount of ERC20 token
	/// @dev Requires prior approval for this contract to spend the tokens
	/// @dev recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt
	/// @param tokenAddress The address of the ERC20 token contract
	/// @param recipientSaltHash The hash of the recipient's address and a secret salt
	/// @param amount The amount of tokens to deposit
	/// @param amlPermission The data to verify AML check
	/// @param eligibilityPermission The data to verify eligibility check
	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external;

	/// @notice Deposit an ERC721 token
	/// @dev Requires prior approval for this contract to transfer the token
	/// @param tokenAddress The address of the ERC721 token contract
	/// @param recipientSaltHash The hash of the recipient's address and a secret salt
	/// @param tokenId The ID of the token to deposit
	/// @param amlPermission The data to verify AML check
	/// @param eligibilityPermission The data to verify eligibility check
	function depositERC721(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external;

	/// @notice Deposit a specified amount of ERC1155 tokens
	/// @param tokenAddress The address of the ERC1155 token contract
	/// @param recipientSaltHash The hash of the recipient's address and a secret salt
	/// @param tokenId The ID of the token to deposit
	/// @param amount The amount of tokens to deposit
	/// @param amlPermission The data to verify AML check
	/// @param eligibilityPermission The data to verify eligibility check
	function depositERC1155(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		uint256 amount,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external;

	/// @notice Trusted nodes submit the IDs of deposits that do not meet AML standards by this method
	/// @dev upToDepositId specifies the last deposit id that have been relayed. It must be greater than lastRelayedDeposit and less than or equal to the latest Deposit ID.
	/// @param upToDepositId The upper limit of the Deposit ID that has been relayed. It must be greater than lastRelayedDeposit and less than or equal to the latest Deposit ID.
	/// @param gasLimit The gas limit for the l2 transaction.
	function relayDeposits(
		uint256 upToDepositId,
		uint256 gasLimit
	) external payable;

	/// @notice Method to cancel a deposit
	/// @dev The deposit ID and its content should be included in the calldata
	/// @param depositId The ID of the deposit to cancel
	/// @param deposit The deposit data
	function cancelDeposit(
		uint256 depositId,
		DepositLib.Deposit calldata deposit
	) external;

	/// @notice Process withdrawals, called by the scroll messenger
	/// @param withdrawals Array of withdrawals to process
	/// @param withdrawalHashes Array of withdrawal hashes
	function processWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals,
		bytes32[] calldata withdrawalHashes
	) external;

	/// @notice Get the ID of the last deposit relayed to L2
	/// @return The ID of the last relayed deposit
	function getLastRelayedDepositId() external view returns (uint256);

	/// @notice Get the ID of the last deposit to L2
	/// @return The ID of the last deposit
	function getLastDepositId() external view returns (uint256);

	/// @notice Get deposit data for a given deposit ID
	/// @param depositId The ID of the deposit
	/// @return The deposit data
	function getDepositData(
		uint256 depositId
	) external view returns (DepositQueueLib.DepositData memory);

	/// @notice Get deposit data list for a given deposit IDs
	/// @param depositIds The IDs of the deposit
	/// @return The deposit data list
	function getDepositDataBatch(
		uint256[] memory depositIds
	) external view returns (DepositQueueLib.DepositData[] memory);

	/// @notice Get deposit data hash for a given deposit ID
	/// @param depositId The ID of the deposit
	/// @return The deposit data hash
	function getDepositDataHash(
		uint256 depositId
	) external view returns (bytes32);

	/// @notice Claim withdrawals for tokens that are not direct withdrawals
	/// @param withdrawals Array of withdrawals to claim
	function claimWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external;

	/// @notice Check if the deposit is valid
	/// @param depositId The ID of the deposit
	/// @param recipientSaltHash The hash of the recipient's intmax2 address (BLS public key) and a secret salt
	/// @param tokenIndex The index of the token being deposited
	/// @param amount The amount of tokens deposited
	/// @param isEligible Whether the deposit is eligible for mining rewards
	/// @param sender The address that made the deposit
	/// @return True if the deposit is valid
	function isDepositValid(
		uint256 depositId,
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount,
		bool isEligible,
		address sender
	) external view returns (bool);

	/// @notice ERC1155 token receiver function
	/// @return bytes4 The function selector
	function onERC1155Received(
		address,
		address,
		uint256,
		uint256,
		bytes calldata
	) external pure returns (bytes4);
}
