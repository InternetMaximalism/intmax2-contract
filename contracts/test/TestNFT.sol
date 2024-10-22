/// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {
	constructor() ERC721("TestNFT", "TST") {
		for (uint256 i = 0; i < 10; i++) {
			_mint(msg.sender, i);
		}
	}
}
