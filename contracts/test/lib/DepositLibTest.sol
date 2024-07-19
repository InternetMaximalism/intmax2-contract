// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {DepositLib} from "../../lib/DepositLib.sol";

contract DepositLibTest {
	using DepositLib for DepositLib.Deposit;

	function getHash(
		DepositLib.Deposit memory deposit
	) external pure returns (bytes32) {
		return deposit.getHash();
	}
}
