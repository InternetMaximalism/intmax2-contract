// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {DepositLib} from "../../common/DepositLib.sol";

contract DepositLibTest {
	using DepositLib for DepositLib.Deposit;

	function getHash(
		bytes32 recipientSaltHash,
		uint32 tokenIndex,
		uint256 amount
	) external pure returns (bytes32) {
		DepositLib.Deposit memory deposit = DepositLib.Deposit({
			recipientSaltHash: recipientSaltHash,
			tokenIndex: tokenIndex,
			amount: amount
		});
		return deposit.getHash();
	}
}
