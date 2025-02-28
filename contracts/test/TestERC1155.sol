/// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestERC1155 is ERC1155 {
	constructor() ERC1155("https://foobaa") {}

	function mint(
		address to,
		uint256 id,
		uint256 value,
		bytes memory data
	) external {
		_mint(to, id, value, data);
	}
}
