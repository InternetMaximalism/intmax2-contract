// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library DepositLib {
	/// @dev Represents a leaf in the Deposit tree
	struct Deposit {
		/// @notice Hash of the recipient's intmax2 address and a private salt
		bytes32 recipientSaltHash;
		/// @notice Index of the token being deposited
		uint32 tokenIndex;
		/// @notice Amount of tokens being deposited
		uint256 amount;
	}

	/// @notice Calculates the hash of a Deposit struct
	/// @param deposit The Deposit struct to be hashed
	/// @return bytes32 The calculated hash of the Deposit
	function getHash(Deposit memory deposit) internal pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					deposit.recipientSaltHash,
					deposit.tokenIndex,
					deposit.amount
				)
			);
	}
}
