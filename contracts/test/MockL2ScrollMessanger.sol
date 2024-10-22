// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IL2ScrollMessenger} from "@scroll-tech/contracts/L2/IL2ScrollMessenger.sol";

contract MockL2ScrollMessenger is IL2ScrollMessenger {
	mapping(bytes32 => bool) private isL1MessageExecuted;
	address public _xDomainMessageSender;
	uint256 private nonce;

	function sendMessage(
		address _to,
		uint256 _value,
		bytes calldata _message,
		uint256 _gasLimit,
		address
	) external payable {
		_sendMessage(_to, _value, _message, _gasLimit);
	}

	function sendMessage(
		address _to,
		uint256 _value,
		bytes calldata _message,
		uint256 _gasLimit
	) external payable override {
		_sendMessage(_to, _value, _message, _gasLimit);
	}

	function relayMessage(
		address _from,
		address _to,
		uint256 _value,
		uint256 _nonce,
		bytes memory _message
	) external {
		bytes32 _xDomainCalldataHash = keccak256(
			_encodeXDomainCalldata(_from, _to, _value, _nonce, _message)
		);
		// solhint-disable-next-line gas-custom-errors,reason-string
		require(
			!isL1MessageExecuted[_xDomainCalldataHash],
			"Message was already successfully executed"
		);
		_executeMessage(_from, _to, _value, _message, _xDomainCalldataHash);
	}

	function _sendMessage(
		address _to,
		uint256 _value,
		bytes memory _message,
		uint256 _gasLimit
	) internal {
		(_gasLimit);
		// solhint-disable-next-line gas-custom-errors
		require(msg.value == _value, "msg.value mismatch");
		uint256 _nonce = nonce;
		bytes32 _xDomainCalldataHash = keccak256(
			_encodeXDomainCalldata(msg.sender, _to, _value, _nonce, _message)
		);
		(_xDomainCalldataHash);
		emit SentMessage(msg.sender, _to, _value, _nonce, _gasLimit, _message);
		nonce++;
	}

	function _executeMessage(
		address _from,
		address _to,
		uint256 _value,
		bytes memory _message,
		bytes32 _xDomainCalldataHash
	) internal {
		_xDomainMessageSender = _from;
		// solhint-disable-next-line avoid-low-level-calls
		(bool success, ) = _to.call{value: _value}(_message);
		// reset value to refund gas.
		_xDomainMessageSender = address(0);

		if (success) {
			isL1MessageExecuted[_xDomainCalldataHash] = true;
			emit RelayedMessage(_xDomainCalldataHash);
		} else {
			// solhint-disable-next-line gas-custom-errors
			revert("Failed to execute message");
		}
	}

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

	function xDomainMessageSender() external view returns (address) {
		return _xDomainMessageSender;
	}
}
