// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library WithdrawalLib {
	/// @dev Represents the information for a withdrawal operation
	struct Withdrawal {
		/// @notice The address of the recipient of the withdrawal
		address recipient;
		/// @notice The index of the token being withdrawn
		uint32 tokenIndex;
		/// @notice The amount of tokens being withdrawn
		uint256 amount;
		/// @notice A unique identifier to ensure uniqueness of the withdrawal hash
		uint256 id;
	}

	/// @notice Calculates the hash of a Withdrawal struct
	/// @param withdrawal The Withdrawal struct to be hashed
	/// @return bytes32 The calculated hash of the Withdrawal
	function getHash(
		Withdrawal memory withdrawal
	) internal pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					withdrawal.recipient,
					withdrawal.tokenIndex,
					withdrawal.amount,
					withdrawal.id
				)
			);
	}
}
