// SPDX-License-Identifier: MIT

pragma solidity 0.8.27;
import {IL1ScrollMessenger} from "@scroll-tech/contracts/L1/IL1ScrollMessenger.sol";

contract MockL1ScrollMessenger is IL1ScrollMessenger {
	address public xDomainMessageSender;
	mapping(bytes32 => bool) private isL2MessageExecuted;
	uint256 private nonce;
	uint256 private constant FEE = 0.01 ether;

	function sendMessage(
		address _to,
		uint256 _value,
		bytes memory _message,
		uint256 _gasLimit
	) external payable {
		if (FEE + _value > msg.value) {
			// solhint-disable-next-line gas-custom-errors
			revert("insufficient msg.value");
		}
		_sendMessage(_to, _value, _message, _gasLimit, msg.sender);
		payable(msg.sender).transfer(msg.value - FEE - _value);
	}

	function sendMessage(
		address _to,
		uint256 _value,
		bytes calldata _message,
		uint256 _gasLimit,
		address refundAddress
	) external payable {
		_sendMessage(_to, _value, _message, _gasLimit, msg.sender);
		payable(refundAddress).transfer(msg.value - FEE - _value);
	}

	/// @inheritdoc IL1ScrollMessenger
	function relayMessageWithProof(
		address _from,
		address _to,
		uint256 _value,
		uint256 _nonce,
		bytes memory _message,
		L2MessageProof memory _proof
	) external {
		(_proof);
		bytes32 _xDomainCalldataHash = keccak256(
			_encodeXDomainCalldata(_from, _to, _value, _nonce, _message)
		);
		// solhint-disable-next-line gas-custom-errors,reason-string
		require(
			!isL2MessageExecuted[_xDomainCalldataHash],
			"Message was already successfully executed"
		);
		xDomainMessageSender = _from;
		(bool success, ) = _to.call{value: _value}(_message);
		xDomainMessageSender = address(0);
		if (success) {
			isL2MessageExecuted[_xDomainCalldataHash] = true;
			emit RelayedMessage(_xDomainCalldataHash);
		} else {
			emit FailedRelayedMessage(_xDomainCalldataHash);
		}
	}

	/// @inheritdoc IL1ScrollMessenger
	function replayMessage(
		address _from,
		address _to,
		uint256 _value,
		uint256 _messageNonce,
		bytes memory _message,
		uint32 _newGasLimit,
		address _refundAddress
	) external payable {
		(_messageNonce);
		(_from);
		(_refundAddress);
		_sendMessage(_to, _value, _message, _newGasLimit, msg.sender);
	}

	/**********************
	 * Internal Functions *
	 **********************/

	function _sendMessage(
		address _to,
		uint256 _value,
		bytes memory _message,
		uint256 _gasLimit,
		address _refundAddress
	) internal {
		(_gasLimit);
		(_refundAddress);
		bytes32 _xDomainCalldataHash = keccak256(
			_encodeXDomainCalldata(msg.sender, _to, _value, nonce, _message)
		);
		(_xDomainCalldataHash);
		emit SentMessage(msg.sender, _to, _value, nonce, _gasLimit, _message);
		nonce++;
	}

	function dropMessage(
		address from,
		address to,
		uint256 value,
		uint256 messageNonce,
		bytes memory message
	) external override {}

	function _encodeXDomainCalldata(
		address _sender,
		address _target,
		uint256 _value,
		uint256 _messageNonce,
		bytes memory _message
	) internal pure returns (bytes memory) {
		return
			abi.encodeWithSignature(
				"relayMessage(address,address,uint256,uint256,bytes)",
				_sender,
				_target,
				_value,
				_messageNonce,
				_message
			);
	}
}
