// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ITokenData {
	enum TokenType {
		NATIVE,
		ERC20,
		ERC721,
		ERC1155
	}

	struct TokenInfo {
		TokenType tokenType;
		address tokenAddress;
		uint256 tokenId;
	}

	error InvalidTokenAddress();
	error InvalidTokenInfo();

	function getTokenInfo(
		uint32 tokenIndex
	) external view returns (TokenInfo memory);

	function getTokenIndex(
		TokenType tokenType,
		address tokenAddress,
		uint256 tokenId
	) external view returns (bool, uint32);
}
