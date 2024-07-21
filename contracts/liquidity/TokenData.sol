// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ITokenData} from "./ITokenData.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TokenData is Initializable, ITokenData {
	address private constant NATIVE_CURRENCY_ADDRESS = address(0);
	uint256 private nextTokenIndex;
	TokenInfo[] private tokenInfoList;
	mapping(address => uint32) private fungibleTokenIndexMap;
	mapping(address => mapping(uint256 => uint32))
		private nonFungibleTokenIndexMap;

	// solhint-disable-next-line func-name-mixedcase
	function __TokenData_init(
		address[] memory initialERC20Tokens
	) public onlyInitializing {
		_createTokenIndex(TokenType.NATIVE, NATIVE_CURRENCY_ADDRESS, 0);
		for (uint256 i = 0; i < initialERC20Tokens.length; i++) {
			_createTokenIndex(TokenType.ERC20, initialERC20Tokens[i], 0);
		}
	}

	function _getOrCreateTokenIndex(
		TokenType tokenType,
		address tokenAddress,
		uint256 tokenId
	) internal returns (uint32) {
		(bool ok, uint32 tokenIndex) = _getTokenIndex(
			tokenType,
			tokenAddress,
			tokenId
		);
		if (ok) {
			return tokenIndex;
		}

		return _createTokenIndex(tokenType, tokenAddress, tokenId);
	}

	function _getNativeTokenIndex() internal view returns (uint32) {
		return fungibleTokenIndexMap[NATIVE_CURRENCY_ADDRESS];
	}

	function _getTokenIndex(
		TokenType tokenType,
		address tokenAddress,
		uint256 tokenId
	) internal view returns (bool, uint32) {
		if (tokenType == TokenType.NATIVE) {
			return (true, fungibleTokenIndexMap[NATIVE_CURRENCY_ADDRESS]);
		}
		if (tokenAddress == address(0)) {
			revert InvalidTokenAddress();
		}
		if (tokenType == TokenType.ERC20) {
			uint32 tokenIndex = fungibleTokenIndexMap[tokenAddress];
			if (tokenIndex != 0) {
				return (true, tokenIndex);
			}
		}
		if (tokenType == TokenType.ERC721 || tokenType == TokenType.ERC1155) {
			uint32 tokenIndex = nonFungibleTokenIndexMap[tokenAddress][tokenId];
			if (tokenIndex != 0) {
				return (true, tokenIndex);
			}
		}
		return (false, 0);
	}

	function _createTokenIndex(
		TokenType tokenType,
		address tokenAddress,
		uint256 tokenId
	) private returns (uint32) {
		uint32 tokenIndex = uint32(nextTokenIndex);
		nextTokenIndex += 1;
		tokenInfoList.push(TokenInfo(tokenType, tokenAddress, tokenId));
		if (tokenType == TokenType.NATIVE) {
			fungibleTokenIndexMap[NATIVE_CURRENCY_ADDRESS] = tokenIndex;
			return tokenIndex;
		}
		if (tokenAddress == address(0)) {
			revert InvalidTokenAddress();
		}
		if (tokenType == TokenType.ERC20) {
			fungibleTokenIndexMap[tokenAddress] = tokenIndex;
			return tokenIndex;
		}
		// ERC721 or ERC1155
		nonFungibleTokenIndexMap[tokenAddress][tokenId] = tokenIndex;
		return tokenIndex;
	}

	function getTokenInfo(
		uint32 tokenIndex
	) public view returns (TokenInfo memory) {
		return tokenInfoList[tokenIndex];
	}
}
