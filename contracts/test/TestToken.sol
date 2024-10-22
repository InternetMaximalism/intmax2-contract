// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
	constructor(address recipient) ERC20("TestERC20", "TOKEN") {
		_mint(recipient, 1000000000000000000000000);
	}
}
