// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {WithdrawalLib} from "../../common/WithdrawalLib.sol";

contract WithdrawalLibTest {
	using WithdrawalLib for WithdrawalLib.Withdrawal;

	function getHash(
		address recipient,
		uint32 tokenIndex,
		uint256 amount,
		uint256 id
	) external pure returns (bytes32) {
		WithdrawalLib.Withdrawal memory withdrawal = WithdrawalLib.Withdrawal({
			recipient: recipient,
			tokenIndex: tokenIndex,
			amount: amount,
			id: id
		});
		return withdrawal.getHash();
	}

	function createWithdrawal(
		address recipient,
		uint32 tokenIndex,
		uint256 amount,
		uint256 id
	) external pure returns (WithdrawalLib.Withdrawal memory) {
		return
			WithdrawalLib.Withdrawal({
				recipient: recipient,
				tokenIndex: tokenIndex,
				amount: amount,
				id: id
			});
	}
}
