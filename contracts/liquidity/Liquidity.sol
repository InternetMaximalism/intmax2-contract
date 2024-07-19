// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ILiquidity} from "./ILiquidity.sol";
import {IRollup} from "../rollup/Rollup.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IL1ScrollMessenger} from "@scroll-tech/contracts/L1/IL1ScrollMessenger.sol";
import {TokenData} from "./TokenData.sol";
import {DepositLib} from "../common/DepositLib.sol";
import {WithdrawalLib} from "../common/WithdrawalLib.sol";


import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {DepositQueueLib} from "./lib/DepositQueueLib.sol";

contract Liquidity is
	TokenData,
	UUPSUpgradeable,
	OwnableUpgradeable,
	ReentrancyGuardUpgradeable,
	ILiquidity
{
	using SafeERC20 for IERC20;
	using DepositLib for DepositLib.Deposit;
	using WithdrawalLib for WithdrawalLib.Withdrawal;
	using DepositQueueLib for DepositQueueLib.DepositQueue;

	IL1ScrollMessenger private l1ScrollMessenger;
	address private rollup;
	mapping(bytes32 => uint256) private claimableWithdrawals;
	DepositQueueLib.DepositQueue private depositQueue;

	modifier onlyRollup() {
		// note
		// The specification of ScrollMessenger may change in the future.
		// https://docs.scroll.io/en/developers/l1-and-l2-bridging/the-scroll-messenger/
		if (rollup == address(0)) {
			revert RollupContractNotSet();
		}
		if (_msgSender() != address(l1ScrollMessenger)) {
			revert SenderIsNotScrollMessenger();
		}
		if (rollup != l1ScrollMessenger.xDomainMessageSender()) {
			revert InvalidRollup();
		}
		_;
	}

	function initialize(
		address _l1ScrollMessenger,
		address _rollup,
		address[] memory inititialERC20Tokens
	) public initializer {
		__Ownable_init(_msgSender());
		__UUPSUpgradeable_init();
		__ReentrancyGuard_init();
		__TokenData_init(inititialERC20Tokens);
		depositQueue.initialize();
		l1ScrollMessenger = IL1ScrollMessenger(_l1ScrollMessenger);
		rollup = _rollup;
	}

	function depositETH(bytes32 recipientSaltHash) external payable {
		if (msg.value == 0) {
			revert InvalidValue();
		}
		uint32 tokenIndex = _getNativeTokenIndex();
		_deposit(_msgSender(), recipientSaltHash, tokenIndex, msg.value);
	}

	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount
	) public {
		if (amount == 0) {
			revert InvalidAmount();
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
	) public {
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
	) public {
		if (amount == 0) {
			revert InvalidAmount();
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

	function analyzeDeposits(
		uint256 upToDepositId,
		uint256[] memory rejectDepositIndices
	) external onlyOwner {
		depositQueue.analyze(upToDepositId, rejectDepositIndices);
		emit DepositsAnalyzed(upToDepositId, rejectDepositIndices);
	}

	function relayDeposits(
		uint256 upToDepositId,
		uint256 gasLimit
	) external payable nonReentrant {
		bytes32[] memory depositHashes = depositQueue.collectAcceptedDeposits(
			upToDepositId
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
		emit DepositsRelayed(upToDepositId, gasLimit, message);
	}

	function replayDeposits(
		bytes memory message,
		uint32 newGasLimit,
		uint256 messageNonce
	) external payable nonReentrant {
		l1ScrollMessenger.replayMessage{value: msg.value}(
			address(this), // from
			rollup, // to
			0, // value
			messageNonce,
			message,
			newGasLimit,
			_msgSender()
		);
		emit DepositsReplayed(newGasLimit, messageNonce, message);
	}

	function claimWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external {
		for (uint256 i = 0; i < withdrawals.length; i++) {
			WithdrawalLib.Withdrawal memory withdrawal = withdrawals[i];
			bytes32 withdrawalHash = withdrawal.getHash();
			if (claimableWithdrawals[withdrawalHash] == 0) {
				revert WithdrawalNotFound(withdrawalHash);
			}
			TokenInfo memory tokenInfo = getTokenInfo(withdrawal.tokenIndex);
			delete claimableWithdrawals[withdrawalHash];
			sendToken(
				tokenInfo.tokenType,
				tokenInfo.tokenAddress,
				withdrawal.recipient,
				withdrawal.amount,
				tokenInfo.tokenId
			);
		}
	}

	function cancelDeposit(
		uint256 depositId,
		DepositLib.Deposit memory deposit
	) public {
		DepositQueueLib.DepositData memory depositData = depositQueue
			.deleteDeposit(depositId);
		if (depositData.sender != _msgSender()) {
			revert OnlyRecipientCanCancelDeposit();
		}
		_cancelDeposit(depositData, deposit);
		emit DepositCanceled(depositId);
	}

	function _cancelDeposit(
		DepositQueueLib.DepositData memory depositData,
		DepositLib.Deposit memory deposit
	) private {
		if (depositData.depositHash == bytes32(0)) {
			revert InvalidDepositHash();
		}
		if (depositData.depositHash != deposit.getHash()) {
			revert InvalidDepositHash();
		}
		TokenInfo memory tokenInfo = getTokenInfo(deposit.tokenIndex);
		sendToken(
			tokenInfo.tokenType,
			tokenInfo.tokenAddress,
			depositData.sender,
			deposit.amount,
			tokenInfo.tokenId
		);
	}

	function _deposit(
		address sender,
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount
	) internal {
		bytes32 depositHash = DepositLib
			.Deposit(recipientSaltHash, tokenIndex, amount)
			.getHash();
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

	function sendToken(
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

	// called by Rollup contract
	function processDirectWithdrawals(
		WithdrawalLib.Withdrawal[] calldata withdrawals
	) external onlyRollup {
		for (uint256 i = 0; i < withdrawals.length; i++) {
			TokenInfo memory tokenInfo = getTokenInfo(
				withdrawals[i].tokenIndex
			);
			sendToken(
				tokenInfo.tokenType,
				tokenInfo.tokenAddress,
				withdrawals[i].recipient,
				withdrawals[i].amount,
				tokenInfo.tokenId
			);
		}
	}

	// called by Rollup contract
	function processClaimableWithdrawals(
		bytes32[] calldata withdrawalHahes
	) external onlyRollup {
		for (uint256 i = 0; i < withdrawalHahes.length; i++) {
			claimableWithdrawals[withdrawalHahes[i]] = block.timestamp;
			emit WithdrawalClaimable(withdrawalHahes[i]);
		}
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
