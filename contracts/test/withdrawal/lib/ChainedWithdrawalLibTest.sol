// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ChainedWithdrawalLib} from "../../../withdrawal/lib/ChainedWithdrawalLib.sol";

contract ChainedWithdrawalLibTest {
	function verifyWithdrawalChain(
		ChainedWithdrawalLib.ChainedWithdrawal[] memory withdrawals,
		bytes32 lastWithdrawalHash
	) external pure returns (bool) {
		return
			ChainedWithdrawalLib.verifyWithdrawalChain(
				withdrawals,
				lastWithdrawalHash
			);
	}
}
