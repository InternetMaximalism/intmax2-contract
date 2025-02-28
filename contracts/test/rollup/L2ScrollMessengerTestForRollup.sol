// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IRollup} from "../../rollup/IRollup.sol";

contract L2ScrollMessengerTestForRollup {
	address public result;

	function setResult(address _result) external {
		result = _result;
	}

	function xDomainMessageSender() external view returns (address) {
		return result;
	}

	function processDeposits(
		address rollup,
		uint256 _lastProcessedDepositId,
		bytes32[] calldata depositHashes
	) external {
		IRollup(rollup).processDeposits(_lastProcessedDepositId, depositHashes);
	}
}
