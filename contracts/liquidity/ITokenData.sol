// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title Token Data Interface
 * @notice Interface for managing token information and indices in the Intmax2 protocol
 * @dev Provides functions to store, retrieve, and manage different token types (Native, ERC20, ERC721, ERC1155)
 */
interface ITokenData {
	/// @notice Error thrown when attempting to use a zero address for a non-native token
	/// @dev Native tokens use address(0), but other token types must have a valid contract address
	error TokenAddressIsZero();

	/**
	 * @notice Enum representing different token types supported by the protocol
	 * @dev Used to determine how to handle each token type during deposits and withdrawals
	 */
	enum TokenType {
		NATIVE, // ETH or native chain currency
		ERC20,  // Fungible tokens following the ERC20 standard
		ERC721, // Non-fungible tokens following the ERC721 standard
		ERC1155 // Semi-fungible tokens following the ERC1155 standard
	}

	/**
	 * @notice Struct containing information about a token
	 * @dev Used to store all necessary information to identify and handle a token
	 * @param tokenType The type of the token (NATIVE, ERC20, ERC721, ERC1155)
	 * @param tokenAddress The address of the token contract (zero address for native tokens)
	 * @param tokenId The ID of the token (used for ERC721 and ERC1155, ignored for NATIVE and ERC20)
	 */
	struct TokenInfo {
		TokenType tokenType;
		address tokenAddress;
		uint256 tokenId;
	}

	/**
	 * @notice Retrieves token information for a given token index
	 * @dev Token indices are assigned sequentially as new tokens are added to the system
	 * @param tokenIndex The index of the token to retrieve information for
	 * @return TokenInfo struct containing the token's type, address, and ID
	 */
	function getTokenInfo(
		uint32 tokenIndex
	) external view returns (TokenInfo memory);

	/**
	 * @notice Retrieves the token index for given token parameters
	 * @dev Used to look up a token's index based on its identifying information
	 * @param tokenType The type of the token (NATIVE, ERC20, ERC721, ERC1155)
	 * @param tokenAddress The address of the token contract (zero address for native tokens)
	 * @param tokenId The ID of the token (used for ERC721 and ERC1155, ignored for NATIVE and ERC20)
	 * @return bool Indicating whether the token index was found (true) or not (false)
	 * @return uint32 The index of the token if found, 0 if not found
	 */
	function getTokenIndex(
		TokenType tokenType,
		address tokenAddress,
		uint256 tokenId
	) external view returns (bool, uint32);

	/**
	 * @notice Retrieves the index of the native token (ETH)
	 * @dev The native token is always at index 0 in the system
	 * @return uint32 The index of the native token (always 0)
	 */
	function getNativeTokenIndex() external view returns (uint32);
}
