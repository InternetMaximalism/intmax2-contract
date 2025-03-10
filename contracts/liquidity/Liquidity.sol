// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ILiquidity} from "./ILiquidity.sol";
import {IRollup} from "../rollup/Rollup.sol";
import {IContribution} from "../contribution/Contribution.sol";
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

	/// @notice Analyzer role constant
	bytes32 public constant ANALYZER = keccak256("ANALYZER");

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

	/// @notice Mapping of deposit hashes to a boolean indicating whether the deposit hash exists
	mapping(bytes32 => uint256) public claimableWithdrawals;

	/// @notice Mapping of deposit hashes to a boolean indicating whether the deposit hash exists
	mapping(bytes32 => bool) private doesDepositHashExist;

	/// @notice deposit information queue
	DepositQueueLib.DepositQueue private depositQueue;

	modifier onlyWithdrawalRole() {
		// Cache the values to avoid multiple storage reads
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
			if (!depositData.isRejected) {
				revert AlreadyAnalyzed();
			}
		}
		_;
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
		// Set deployment time to the next day
		deploymentTime = (block.timestamp / 1 days + 1) * 1 days;
	}

	function initialize(
		address _admin,
		address _l1ScrollMessenger,
		address _rollup,
		address _withdrawal,
		address _claim,
		address _analyzer,
		address _contribution,
		address[] memory initialERC20Tokens
	) external initializer {
		if (_admin == address(0)) {
			revert AddressZero();
		}
		if (_l1ScrollMessenger == address(0)) {
			revert AddressZero();
		}
		if (_rollup == address(0)) {
			revert AddressZero();
		}
		if (_withdrawal == address(0)) {
			revert AddressZero();
		}
		if (_claim == address(0)) {
			revert AddressZero();
		}
		if (_analyzer == address(0)) {
			revert AddressZero();
		}
		if (_contribution == address(0)) {
			revert AddressZero();
		}
		_grantRole(DEFAULT_ADMIN_ROLE, _admin);
		_grantRole(ANALYZER, _analyzer);
		_grantRole(WITHDRAWAL, _withdrawal);
		_grantRole(WITHDRAWAL, _claim);
		__UUPSUpgradeable_init();
		__AccessControl_init();
		__TokenData_init(initialERC20Tokens);
		depositQueue.initialize();
		l1ScrollMessenger = IL1ScrollMessenger(_l1ScrollMessenger);
		contribution = IContribution(_contribution);
		rollup = _rollup;
	}

	function pauseDeposits() external onlyRole(DEFAULT_ADMIN_ROLE) {
		_pause();
	}

	function unpauseDeposits() external onlyRole(DEFAULT_ADMIN_ROLE) {
		_unpause();
	}

	function depositNativeToken(
		bytes32 recipientSaltHash
	) external payable whenNotPaused {
		if (msg.value == 0) {
			revert TriedToDepositZero();
		}
		uint32 tokenIndex = getNativeTokenIndex();
		_deposit(_msgSender(), recipientSaltHash, tokenIndex, msg.value);
	}

	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount
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
		_deposit(_msgSender(), recipientSaltHash, tokenIndex, amount);
	}

	function depositERC721(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId
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
		_deposit(_msgSender(), recipientSaltHash, tokenIndex, 1);
	}

	function depositERC1155(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 tokenId,
		uint256 amount
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
		_deposit(_msgSender(), recipientSaltHash, tokenIndex, amount);
	}

	function analyzeAndRelayDeposits(
		uint256 upToDepositId,
		uint256[] memory rejectDepositIds,
		uint256 gasLimit
	) external payable onlyRole(ANALYZER) {
		bytes32[] memory depositHashes = depositQueue.analyze(
			upToDepositId,
			rejectDepositIds
		);
		bytes memory message = abi.encodeWithSelector(
			IRollup.processDeposits.selector,
			upToDepositId,
			depositHashes
		);
		// note
		// The specification of ScrollMessenger may change in the future.
		// https://docs.scroll.io/en/developers/l1-and-l2-bridging/the-scroll-messenger/
		l1ScrollMessenger.sendMessage{value: msg.value}(
			rollup, // to
			0, // value
			message,
			gasLimit,
			_msgSender()
		);
		emit DepositsAnalyzedAndRelayed(
			upToDepositId,
			rejectDepositIds,
			gasLimit,
			message
		);
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
			TokenInfo memory tokenInfo = getTokenInfo(w.tokenIndex);
			delete claimableWithdrawals[withdrawalHash];
			_sendToken(
				tokenInfo.tokenType,
				tokenInfo.tokenAddress,
				w.recipient,
				w.amount,
				tokenInfo.tokenId
			);
			emit ClaimedWithdrawal(w.recipient, withdrawalHash);
		}
	}

	function cancelDeposit(
		uint256 depositId,
		DepositLib.Deposit memory deposit
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
		uint256 amount
	) private {
		uint256 depositLimit = DepositLimit.getDepositLimit(
			tokenIndex,
			block.timestamp
		);
		if (amount > depositLimit) {
			revert DepositAmountExceedsLimit(amount, depositLimit);
		}
		bool isEligible = true; // TODO: Implement eligibility check
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
		if (depositData.isRejected) {
			return false;
		}
		return true;
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

		bool result = true;
		if (tokenInfo.tokenType == TokenType.NATIVE) {
			// solhint-disable-next-line check-send-result
			bool success = payable(withdrawal_.recipient).send(
				withdrawal_.amount
			);
			result = success;
		} else if (tokenInfo.tokenType == TokenType.ERC20) {
			bytes memory transferCall = abi.encodeWithSelector(
				IERC20(tokenInfo.tokenAddress).transfer.selector,
				withdrawal_.recipient,
				withdrawal_.amount
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
