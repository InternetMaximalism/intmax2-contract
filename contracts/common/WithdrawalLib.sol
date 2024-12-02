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
		/// @notice The nullifier of the withdrawal,
		/// which is used to ensure the uniqueness of the withdrawal
		bytes32 nullifier;
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
					withdrawal.nullifier
				)
			);
	}
}
