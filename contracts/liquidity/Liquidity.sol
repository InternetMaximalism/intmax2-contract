// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ILiquidity} from "./ILiquidity.sol";
import {IRollup} from "../rollup/IRollup.sol";
import {IContribution} from "../contribution/IContribution.sol";
import {IPermitter} from "../permitter/IPermitter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IL1ScrollMessenger} from "@scroll-tech/contracts/L1/IL1ScrollMessenger.sol";

import {TokenData} from "./TokenData.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import {DepositLib} from "../common/DepositLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";
import {DepositQueueLib} from "./lib/DepositQueueLib.sol";
import {ERC20CallOptionalLib} from "./lib/ERC20CallOptionalLib.sol";
import {DepositLimit} from "./lib/DepositLimit.sol";

contract Liquidity is
	TokenData,
	PausableUpgradeable,
	UUPSUpgradeable,
	AccessControlUpgradeable,
	ILiquidity
{
	using SafeERC20 for IERC20;
	using ERC20CallOptionalLib for IERC20;
	using DepositLib for DepositLib.Deposit;
	using WithdrawalLib for WithdrawalLib.Withdrawal;
	using DepositQueueLib for DepositQueueLib.DepositQueue;

	/// @notice Relayer role constant
	bytes32 public constant RELAYER = keccak256("RELAYER");

	/// @notice Withdrawal role constant
	bytes32 public constant WITHDRAWAL = keccak256("WITHDRAWAL");

	/// @notice Deployment time which is used to calculate the deposit limit
	uint256 private deploymentTime;

	/// @notice Address of the L1 ScrollMessenger contract
	IL1ScrollMessenger private l1ScrollMessenger;

	/// @notice Address of the Contribution contract
	IContribution private contribution;

	/// @notice Address of the Rollup contract
	address private rollup;

	/// @notice Address of the AML Permitter contract
	/// @dev If not set, we skip AML check
	IPermitter public amlPermitter;

	/// @notice Address of the Circulation Permitter contract
	/// @dev If not set, we skip eligibility permission check
	IPermitter public eligibilityPermitter;

	/// @notice Mapping of deposit hashes to a boolean indicating whether the deposit hash exists
	mapping(bytes32 => uint256) public claimableWithdrawals;

	/// @notice Mapping of deposit hashes to a boolean indicating whether the deposit hash exists
	mapping(bytes32 => bool) private doesDepositHashExist;

	/// @notice Withdrawal fee ratio for each token index (denominated in basis points, 1bp = 0.01%, range: 0-10000)
	/// @dev The admin is responsible for ensuring appropriate fee settings and bears the responsibility
	///      of maintaining fair fee structures, especially for NFT withdrawals which should be set to 0.
	mapping(uint32 => uint256) public withdrawalFeeRatio;

	/// @notice deposit information queue
	DepositQueueLib.DepositQueue private depositQueue;

	modifier onlyWithdrawalRole() {
		IL1ScrollMessenger l1ScrollMessengerCached = l1ScrollMessenger;
		if (_msgSender() != address(l1ScrollMessengerCached)) {
			revert SenderIsNotScrollMessenger();
		}
		if (
			!hasRole(WITHDRAWAL, l1ScrollMessengerCached.xDomainMessageSender())
		) {
			revert InvalidWithdrawalAddress();
		}
		_;
	}

	modifier canCancelDeposit(
		uint256 depositId,
		DepositLib.Deposit memory deposit
	) {
		DepositQueueLib.DepositData memory depositData = depositQueue
			.depositData[depositId];
		if (depositData.sender != _msgSender()) {
			revert OnlySenderCanCancelDeposit();
		}
		bytes32 depositHash = deposit.getHash();
		if (depositData.depositHash != depositHash) {
			revert InvalidDepositHash(depositData.depositHash, depositHash);
		}
		if (depositId <= getLastRelayedDepositId()) {
			revert AlreadyRelayed();
		}
		_;
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/// @notice Initializes the contract with required addresses and parameters
	/// @param _admin The address that will have admin privileges
	/// @param _l1ScrollMessenger The address of the L1ScrollMessenger contract
	/// @param _rollup The address of the Rollup contract
	/// @param _withdrawal The address that will have withdrawal privileges
	/// @param _claim The address that will have claim privileges
	/// @param _relayer The address that will have relayer privileges
	/// @param _contribution The address of the Contribution contract
	/// @param initialERC20Tokens Initial list of ERC20 token addresses to support
	function initialize(
		address _admin,
		address _l1ScrollMessenger,
		address _rollup,
		address _withdrawal,
		address _claim,
		address _relayer,
		address _contribution,
		address[] memory initialERC20Tokens
	) external initializer {
		if (
			_admin == address(0) ||
			_l1ScrollMessenger == address(0) ||
			_rollup == address(0) ||
			_withdrawal == address(0) ||
			_claim == address(0) ||
			_relayer == address(0) ||
			_contribution == address(0)
		) {
			revert AddressZero();
		}
		_grantRole(DEFAULT_ADMIN_ROLE, _admin);
		_grantRole(RELAYER, _relayer);
		_grantRole(WITHDRAWAL, _withdrawal);
		_grantRole(WITHDRAWAL, _claim);
		__UUPSUpgradeable_init();
		__AccessControl_init();
		__TokenData_init(initialERC20Tokens);
		__Pausable_init();
		depositQueue.initialize();
		l1ScrollMessenger = IL1ScrollMessenger(_l1ScrollMessenger);
		contribution = IContribution(_contribution);

		rollup = _rollup;
		// Set deployment time to the next day
		deploymentTime = (block.timestamp / 1 days + 1) * 1 days;
	}

	function setPermitter(
		address _amlPermitter,
		address _eligibilityPermitter
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		amlPermitter = IPermitter(_amlPermitter);
		eligibilityPermitter = IPermitter(_eligibilityPermitter);
		emit PermitterSet(_amlPermitter, _eligibilityPermitter);
	}

	function setWithdrawalFeeRatio(
		uint32 tokenIndex,
		uint256 feeRatio
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		withdrawalFeeRatio[tokenIndex] = feeRatio;
		emit WithdrawalFeeRatioSet(tokenIndex, feeRatio);
	}

	function pauseDeposits() external onlyRole(DEFAULT_ADMIN_ROLE) {
		_pause();
	}

	function unpauseDeposits() external onlyRole(DEFAULT_ADMIN_ROLE) {
		_unpause();
	}

	function depositNativeToken(
		bytes32 recipientSaltHash,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external payable whenNotPaused {
		if (msg.value == 0) {
			revert TriedToDepositZero();
		}
		uint32 tokenIndex = getNativeTokenIndex();
		bytes memory encodedData = abi.encodeWithSignature(
			"depositNativeToken(bytes32)",
			recipientSaltHash
		);
		_deposit(
			_msgSender(),
			recipientSaltHash,
			tokenIndex,
			msg.value,
			encodedData,
			amlPermission,
			eligibilityPermission
		);
	}

	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external whenNotPaused {
		if (amount == 0) {
			revert TriedToDepositZero();
		}
		IERC20(tokenAddress).safeTransferFrom(
			_msgSender(),
			address(this),
			amount
		);
		uint32 tokenIndex = _getOrCreateTokenIndex(
			TokenType.ERC20,
			tokenAddress,
			0
		);
		bytes memory encodedData = abi.encodeWithSignature(
			"depositERC20(address,bytes32,uint256)",
			tokenAddress,
			recipientSaltHash,
			amount
		);

		_deposit(
			_msgSender(),
			recipientSaltHash,
			tokenIndex,
			amount,
			encodedData,
			amlPermission,
			eligibilityPermission
		);
	}

	function depositERC721(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external whenNotPaused {
		IERC721(tokenAddress).transferFrom(
			_msgSender(),
			address(this),
			tokenId
		);
		uint32 tokenIndex = _getOrCreateTokenIndex(
			TokenType.ERC721,
			tokenAddress,
			tokenId
		);
		bytes memory encodedData = abi.encodeWithSignature(
			"depositERC721(address,bytes32,uint256)",
			tokenAddress,
			recipientSaltHash,
			tokenId
		);
		_deposit(
			_msgSender(),
			recipientSaltHash,
			tokenIndex,
			1,
			encodedData,
			amlPermission,
			eligibilityPermission
		);
	}

	function depositERC1155(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		uint256 amount,
		bytes calldata amlPermission,
		bytes calldata eligibilityPermission
	) external whenNotPaused {
		if (amount == 0) {
			revert TriedToDepositZero();
		}
		IERC1155(tokenAddress).safeTransferFrom(
			_msgSender(),
			address(this),
			tokenId,
			amount,
			bytes("")
		);
		uint32 tokenIndex = _getOrCreateTokenIndex(
			TokenType.ERC1155,
			tokenAddress,
			tokenId
		);
		bytes memory encodedData = abi.encodeWithSignature(
			"depositERC1155(address,bytes32,uint256,uint256)",
			tokenAddress,
			recipientSaltHash,
			tokenId,
			amount
		);
		_deposit(
			_msgSender(),
			recipientSaltHash,
			tokenIndex,
			amount,
			encodedData,
			amlPermission,
			eligibilityPermission
		);
	}

	function relayDeposits(
		uint256 upToDepositId,
		uint256 gasLimit
	) external payable onlyRole(RELAYER) {
		bytes32[] memory depositHashes = depositQueue.batchDequeue(
			upToDepositId
		);
		bytes memory message = abi.encodeWithSelector(
			IRollup.processDeposits.selector,
			upToDepositId,
			depositHashes
		);
		l1ScrollMessenger.sendMessage{value: msg.value}(
			rollup, // to
			0, // value
			message,
			gasLimit,
			_msgSender()
		);
		emit DepositsRelayed(upToDepositId, gasLimit, message);
	}

	function claimWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external {
		for (uint256 i = 0; i < withdrawals.length; i++) {
			WithdrawalLib.Withdrawal memory w = withdrawals[i];
			bytes32 withdrawalHash = w.getHash();
			if (claimableWithdrawals[withdrawalHash] == 0) {
				revert WithdrawalNotFound(withdrawalHash);
			}
			uint256 fee = _getWithdrawalFee(w.tokenIndex, w.amount);
			uint256 amountAfterFee = w.amount - fee;
			TokenInfo memory tokenInfo = getTokenInfo(w.tokenIndex);
			delete claimableWithdrawals[withdrawalHash];
			_sendToken(
				tokenInfo.tokenType,
				tokenInfo.tokenAddress,
				w.recipient,
				amountAfterFee,
				tokenInfo.tokenId
			);
			emit ClaimedWithdrawal(w.recipient, withdrawalHash);
			if (fee > 0) {
				emit WithdrawalFeeCollected(w.tokenIndex, fee);
			}
		}
	}

	function cancelDeposit(
		uint256 depositId,
		DepositLib.Deposit calldata deposit
	) external canCancelDeposit(depositId, deposit) {
		DepositQueueLib.DepositData memory depositData = depositQueue
			.deleteDeposit(depositId);
		TokenInfo memory tokenInfo = getTokenInfo(deposit.tokenIndex);
		_sendToken(
			tokenInfo.tokenType,
			tokenInfo.tokenAddress,
			depositData.sender,
			deposit.amount,
			tokenInfo.tokenId
		);
		emit DepositCanceled(depositId);
	}

	function _deposit(
		address sender,
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount,
		bytes memory encodedData,
		bytes memory amlPermission,
		bytes memory eligibilityPermission
	) private {
		_validateAmlPermission(encodedData, amlPermission);
		bool isEligible = _validateEligibilityPermission(
			encodedData,
			eligibilityPermission
		);
		uint256 depositLimit = DepositLimit.getDepositLimit(
			tokenIndex,
			deploymentTime
		);
		if (amount > depositLimit) {
			revert DepositAmountExceedsLimit(amount, depositLimit);
		}
		bytes32 depositHash = DepositLib
			.Deposit(sender, recipientSaltHash, amount, tokenIndex, isEligible)
			.getHash();
		if (doesDepositHashExist[depositHash]) {
			revert DepositHashAlreadyExists(depositHash);
		}
		doesDepositHashExist[depositHash] = true;
		uint256 depositId = depositQueue.enqueue(depositHash, sender);
		emit Deposited(
			depositId,
			sender,
			recipientSaltHash,
			tokenIndex,
			amount,
			isEligible,
			block.timestamp
		);
	}

	function _sendToken(
		TokenType tokenType,
		address token,
		address recipient,
		uint256 amount,
		uint256 tokenId
	) private {
		if (tokenType == TokenType.NATIVE) {
			payable(recipient).transfer(amount);
		} else if (tokenType == TokenType.ERC20) {
			IERC20(token).safeTransfer(recipient, amount);
		} else if (tokenType == TokenType.ERC721) {
			IERC721(token).transferFrom(address(this), recipient, tokenId);
		} else {
			IERC1155(token).safeTransferFrom(
				address(this),
				recipient,
				tokenId,
				amount,
				bytes("")
			);
		}
	}

	function processWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals,
		bytes32[] calldata withdrawalHashes
	) external onlyWithdrawalRole {
		_processDirectWithdrawals(withdrawals);
		_processClaimableWithdrawals(withdrawalHashes);
	}

	function _processDirectWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) private {
		for (uint256 i = 0; i < withdrawals.length; i++) {
			_processDirectWithdrawal(withdrawals[i]);
		}
		if (withdrawals.length > 0) {
			// In the ScrollMessenger, it is not possible to identify the person who relayed the message.
			// Here we consider tx.origin as the gas payer and record their contribution accordingly.
			// However, this approach can be problematic in cases of sponsored transactions or meta transactions,
			// where the actual gas payer may differ from tx.origin.
			contribution.recordContribution(
				keccak256("PROCESS_DIRECT_WITHDRAWALS"),
				// solhint-disable-next-line avoid-tx-origin
				tx.origin, // msg.sender is ScrollMessenger, so we use tx.origin
				withdrawals.length
			);
		}
	}

	function _processDirectWithdrawal(
		WithdrawalLib.Withdrawal memory withdrawal_
	) internal {
		TokenInfo memory tokenInfo = getTokenInfo(withdrawal_.tokenIndex);
		uint256 fee = _getWithdrawalFee(
			withdrawal_.tokenIndex,
			withdrawal_.amount
		);
		uint256 amountAfterFee = withdrawal_.amount - fee;
		bool result = true;
		if (tokenInfo.tokenType == TokenType.NATIVE) {
			// solhint-disable-next-line check-send-result
			bool success = payable(withdrawal_.recipient).send(amountAfterFee);
			result = success;
		} else if (tokenInfo.tokenType == TokenType.ERC20) {
			bytes memory transferCall = abi.encodeWithSelector(
				IERC20(tokenInfo.tokenAddress).transfer.selector,
				withdrawal_.recipient,
				amountAfterFee
			);
			result = IERC20(tokenInfo.tokenAddress).callOptionalReturnBool(
				transferCall
			);
		} else {
			// ERC721 and ERC1155 tokens are not supported for direct withdrawals
			result = false;
		}
		if (result) {
			emit DirectWithdrawalSuccessed(
				withdrawal_.getHash(),
				withdrawal_.recipient
			);
			if (fee > 0) {
				emit WithdrawalFeeCollected(withdrawal_.tokenIndex, fee);
			}
		} else {
			bytes32 withdrawalHash = withdrawal_.getHash();
			// solhint-disable-next-line reentrancy
			claimableWithdrawals[withdrawalHash] = block.timestamp;
			emit DirectWithdrawalFailed(withdrawalHash, withdrawal_);
			emit WithdrawalClaimable(withdrawalHash);
		}
	}

	function _processClaimableWithdrawals(
		bytes32[] calldata withdrawalHashes
	) private {
		for (uint256 i = 0; i < withdrawalHashes.length; i++) {
			claimableWithdrawals[withdrawalHashes[i]] = block.timestamp;
			emit WithdrawalClaimable(withdrawalHashes[i]);
		}
		if (withdrawalHashes.length > 0) {
			contribution.recordContribution(
				keccak256("PROCESS_CLAIMABLE_WITHDRAWALS"),
				// solhint-disable-next-line avoid-tx-origin
				tx.origin, // msg.sender is ScrollMessenger, so we use tx.origin
				withdrawalHashes.length
			);
		}
	}

	function onERC1155Received(
		address,
		address,
		uint256,
		uint256,
		bytes calldata
	) external pure returns (bytes4) {
		return this.onERC1155Received.selector;
	}

	function _validateAmlPermission(
		bytes memory encodedData,
		bytes memory amlPermission
	) private {
		if (address(amlPermitter) == address(0)) {
			// if aml permitter is not set, skip aml check
			return;
		}
		bool result = amlPermitter.permit(
			_msgSender(),
			msg.value,
			encodedData,
			amlPermission
		);
		if (!result) {
			revert AmlValidationFailed();
		}
		return;
	}

	function _validateEligibilityPermission(
		bytes memory encodedData,
		bytes memory eligibilityPermission
	) private returns (bool) {
		if (address(eligibilityPermitter) == address(0)) {
			// if eligibility permitter is not set, skip eligibility check
			return true;
		}
		if (eligibilityPermission.length == 0) {
			// if eligibility permitter is set but permission doesn't returned, return false.
			return false;
		}
		bool result = eligibilityPermitter.permit(
			_msgSender(),
			msg.value,
			encodedData,
			eligibilityPermission
		);
		if (!result) {
			revert EligibilityValidationFailed();
		}
		return true;
	}

	function _getWithdrawalFee(
		uint32 tokenIndex,
		uint256 amount
	) internal view returns (uint256) {
		uint256 feeRatio = withdrawalFeeRatio[tokenIndex];
		return (amount * feeRatio) / 10000;
	}

	function isDepositValid(
		uint256 depositId,
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount,
		bool isEligible,
		address sender
	) external view returns (bool) {
		DepositQueueLib.DepositData memory depositData = depositQueue
			.depositData[depositId];
		bytes32 depositHash = DepositLib
			.Deposit(sender, recipientSaltHash, amount, tokenIndex, isEligible)
			.getHash();

		if (depositData.depositHash != depositHash) {
			return false;
		}
		if (depositData.sender != sender) {
			return false;
		}
		return true;
	}

	function getDepositData(
		uint256 depositId
	) external view returns (DepositQueueLib.DepositData memory) {
		return depositQueue.depositData[depositId];
	}

	function getDepositDataBatch(
		uint256[] memory depositIds
	) external view returns (DepositQueueLib.DepositData[] memory) {
		DepositQueueLib.DepositData[]
			memory depositData = new DepositQueueLib.DepositData[](
				depositIds.length
			);
		for (uint256 i = 0; i < depositIds.length; i++) {
			depositData[i] = depositQueue.depositData[depositIds[i]];
		}
		return depositData;
	}

	function getDepositDataHash(
		uint256 depositId
	) external view returns (bytes32) {
		return depositQueue.depositData[depositId].depositHash;
	}

	function getLastRelayedDepositId() public view returns (uint256) {
		return depositQueue.front - 1;
	}

	function getLastDepositId() external view returns (uint256) {
		return depositQueue.depositData.length - 1;
	}

	function _authorizeUpgrade(
		address
	) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
