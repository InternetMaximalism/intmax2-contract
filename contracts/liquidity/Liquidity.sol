// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ILiquidity} from "./ILiquidity.sol";
import {IRollup} from "../rollup/Rollup.sol";
import {TokenData} from "./TokenData.sol";
import {DepositLib} from "./DepositLib.sol";
import {WithdrawalLib} from "../rollup/lib/WithdrawalLib.sol";
import {IL1ScrollMessenger} from "@scroll-tech/contracts/L1/IL1ScrollMessenger.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Liquidity is
	TokenData,
	UUPSUpgradeable,
	OwnableUpgradeable,
	ReentrancyGuardUpgradeable,
	ILiquidity
{
	using SafeERC20 for IERC20;
	using DepositLib for Deposit;
	using WithdrawalLib for IRollup.Withdrawal;

	IL1ScrollMessenger private l1ScrollMessenger;
	address private rollup;
	uint256 private withdrawalIdCounter;
	mapping(uint256 => IRollup.Withdrawal) private claimableWithdrawals;

	/**
	 * @dev List of pending deposit requests. They are added when there is a request from a user
	 *  and removed once processed or rejected.
	 */
	DepositData[] public pendingDepositData;

	/**
	 * @dev List of rejected deposit requests. They are removed once claimed.
	 */
	mapping(uint256 => DepositData) private rejectedDepositData;

	uint256 public lastAnalyzedDepositId;
	uint256 public lastProcessedDepositId;

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
		address _usdc,
		address _wbtc
	) public initializer {
		__Ownable_init(_msgSender());
		__UUPSUpgradeable_init();
		__ReentrancyGuard_init();
		__TokenInfo_init(_usdc, _wbtc);
		l1ScrollMessenger = IL1ScrollMessenger(_l1ScrollMessenger);
		rollup = _rollup;
	}

	function depositETH(bytes32 recipientSaltHash) external payable {
		if (recipientSaltHash == bytes32(0)) {
			revert InvalidRecipientSaltHash();
		}
		uint32 tokenIndex = _getNativeTokenIndex();
		_deposit(_msgSender(), recipientSaltHash, tokenIndex, msg.value);
	}

	function depositERC20(
		address tokenAddress,
		bytes32 recipientSaltHash,
		uint256 amount
	) public {
		if (recipientSaltHash == bytes32(0)) {
			revert InvalidRecipientSaltHash();
		}
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
		if (recipientSaltHash == bytes32(0)) {
			revert InvalidRecipientSaltHash();
		}
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
		if (recipientSaltHash == bytes32(0)) {
			revert InvalidRecipientSaltHash();
		}
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

	/**
	 * @notice Withdraw unrejected but outstanding deposits.
	 */
	function cancelPendingDeposit(
		uint256 depositId,
		Deposit memory deposit
	) public {
		if (depositId >= pendingDepositData.length) {
			revert InvalidDepositId();
		}
		DepositData memory depositData = pendingDepositData[depositId];
		if (depositData.sender != _msgSender()) {
			revert OnlyRecipientCanCancelDeposit();
		}
		delete pendingDepositData[depositId];

		_cancelDeposit(depositData, deposit);

		emit DepositCanceled(depositId);
	}

	function rejectDeposits(
		uint256 _lastAnalyzedDepositId,
		uint256[] calldata rejectedDepositIds
	) public onlyOwner {
		lastAnalyzedDepositId = _lastAnalyzedDepositId;
		for (uint256 i = 0; i < rejectedDepositIds.length; i++) {
			uint256 rejectedDepositId = rejectedDepositIds[i];
			rejectedDepositData[rejectedDepositId] = pendingDepositData[
				rejectedDepositId
			];
			delete pendingDepositData[rejectedDepositId];
		}

		emit DepositsRejected(_lastAnalyzedDepositId);
	}

	/**
	 * @notice Withdraw rejected deposits.
	 */
	function claimRejectedDeposit(
		uint256 depositId,
		Deposit memory deposit
	) public {
		DepositData memory depositData = rejectedDepositData[depositId];
		if (depositData.sender != _msgSender()) {
			revert OnlyRecipientCanClaimRejectedDeposit();
		}
		delete rejectedDepositData[depositId];

		_cancelDeposit(depositData, deposit);

		emit DepositCanceled(depositId);
	}

	function submitDeposits(
		uint256 _lastProcessedDepositId
	) public payable nonReentrant {
		if (lastProcessedDepositId < _lastProcessedDepositId) {
			revert InvalidLastProcessedDepositId();
		}
		if (_lastProcessedDepositId <= lastAnalyzedDepositId) {
			revert InvalidLastProcessedDepositId();
		}
		uint256 counter = 0;
		for (
			uint256 i = lastProcessedDepositId + 1;
			i <= _lastProcessedDepositId;
			i++
		) {
			if (pendingDepositData[i].depositHash != bytes32(0)) {
				counter++;
			}
		}
		bytes32[] memory depositHashes = new bytes32[](counter);
		for (
			uint256 i = lastProcessedDepositId;
			i <= _lastProcessedDepositId;
			i++
		) {
			if (pendingDepositData[i].depositHash != bytes32(0)) {
				depositHashes[i] = (pendingDepositData[i].depositHash);
			}
		}

		lastProcessedDepositId = _lastProcessedDepositId;

		// note
		// The specification of ScrollMessenger may change in the future.
		// https://docs.scroll.io/en/developers/l1-and-l2-bridging/the-scroll-messenger/
		bytes memory message = abi.encodeWithSelector(
			IRollup.processDeposits.selector,
			lastProcessedDepositId,
			depositHashes
		);

		// processDeposits is not payable, so value should be 0
		// TODO Check that the value of gaslimit is correct for both testnet and mainnet.
		l1ScrollMessenger.sendMessage{value: msg.value}(
			rollup,
			0, // value
			message,
			200000, // gaslimit
			_msgSender()
		);
		emit DepositsSubmitted(lastProcessedDepositId);
	}

	function processWithdrawals(
		IRollup.Withdrawal[] calldata withdrawals
	) external onlyRollup {
		for (uint256 i = 0; i < withdrawals.length; i++) {
			IRollup.Withdrawal memory withdrawal = withdrawals[i];
			TokenInfo memory tokenInfo = getTokenInfo(withdrawal.tokenIndex);
			if (_isDirectWithdrawalToken(withdrawal.tokenIndex)) {
				sendToken(
					tokenInfo.tokenType,
					tokenInfo.tokenAddress,
					withdrawal.recipient,
					withdrawal.amount,
					tokenInfo.tokenId
				);
				continue;
			}
			claimableWithdrawals[withdrawalIdCounter] = withdrawal;
			emit WithdrawalClaimable(withdrawalIdCounter, withdrawal);
			withdrawalIdCounter++;
		}
	}

	function claimWithdrawals(uint256[] calldata withdrawalIds) external {
		for (uint256 i = 0; i < withdrawalIds.length; i++) {
			IRollup.Withdrawal memory withdrawal = claimableWithdrawals[
				withdrawalIds[i]
			];
			if (withdrawal.isEmpty()) {
				revert WithdrawalNotFound();
			}
			TokenInfo memory tokenInfo = getTokenInfo(withdrawal.tokenIndex);
			delete claimableWithdrawals[withdrawalIds[i]];
			sendToken(
				tokenInfo.tokenType,
				tokenInfo.tokenAddress,
				withdrawal.recipient,
				withdrawal.amount,
				tokenInfo.tokenId
			);
		}
	}

	function _cancelDeposit(
		DepositData memory depositData,
		Deposit memory deposit
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
		uint256 depositId = pendingDepositData.length;
		bytes32 depositHash = Deposit(recipientSaltHash, tokenIndex, amount)
			.getHash();
		pendingDepositData.push(DepositData(depositHash, sender));

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
		address sender,
		uint256 amount,
		uint256 tokenId
	) private {
		if (tokenType == TokenType.NATIVE) {
			payable(sender).transfer(amount);
		} else if (tokenType == TokenType.ERC20) {
			IERC20(token).safeTransfer(sender, amount);
		} else if (tokenType == TokenType.ERC721) {
			IERC721(token).transferFrom(address(this), sender, tokenId);
		} else {
			IERC1155(token).safeTransferFrom(
				address(this),
				sender,
				tokenId,
				amount,
				bytes("")
			);
		}
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
