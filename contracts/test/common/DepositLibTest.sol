// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {DepositLib} from "../../common/DepositLib.sol";

contract DepositLibTest {
	using DepositLib for DepositLib.Deposit;

	function getHash(
		address depositor,
		bytes32 recipientSaltHash,
		uint256 amount,
		uint32 tokenIndex,
		bool isEligible
	) external pure returns (bytes32) {
		DepositLib.Deposit memory deposit = DepositLib.Deposit({
			depositor: depositor,
			recipientSaltHash: recipientSaltHash,
			amount: amount,
			tokenIndex: tokenIndex,
			isEligible: isEligible
		});
		return deposit.getHash();
	}
}
