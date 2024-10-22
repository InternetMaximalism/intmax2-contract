// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface ITokenData {
	/// @notice Error thrown when attempting to use a zero address for a token
	error TokenAddressIsZero();

	/// @notice Enum representing different token types
	enum TokenType {
		NATIVE,
		ERC20,
		ERC721,
		ERC1155
	}

	/// @notice Struct containing information about a token
	struct TokenInfo {
		TokenType tokenType;
		address tokenAddress;
		uint256 tokenId;
	}

	/// @notice Retrieves token information for a given token index
	/// @param tokenIndex The index of the token
	/// @return TokenInfo struct containing the token's information
	function getTokenInfo(
		uint32 tokenIndex
	) external view returns (TokenInfo memory);

	/// @notice Retrieves the token index for given token parameters
	/// @param tokenType The type of the token (NATIVE, ERC20, ERC721, ERC1155)
	/// @param tokenAddress The address of the token contract (zero address for native tokens)
	/// @param tokenId The ID of the token (used for ERC721 and ERC1155)
	/// @return bool Indicating whether the token index was found
	/// @return uint32 The index of the token if found
	function getTokenIndex(
		TokenType tokenType,
		address tokenAddress,
		uint256 tokenId
	) external view returns (bool, uint32);

	/// @notice Retrieves the index of the native token
	/// @return uint32 The index of the native token
	function getNativeTokenIndex() external view returns (uint32);
}
