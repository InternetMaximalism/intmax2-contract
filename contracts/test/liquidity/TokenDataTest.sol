// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {TokenData} from "../../liquidity/TokenData.sol";

contract TokenDataTest is TokenData {
	uint32 public latestTokenIndex;

	function initialize(
		address[] memory initialERC20Tokens
	) public initializer {
		__TokenData_init(initialERC20Tokens);
	}

	function getOrCreateTokenIndex(
		TokenType tokenType,
		address tokenAddress,
		uint256 tokenId
	) public returns (uint32) {
		latestTokenIndex = _getOrCreateTokenIndex(
			tokenType,
			tokenAddress,
			tokenId
		);
		return latestTokenIndex;
	}
}
