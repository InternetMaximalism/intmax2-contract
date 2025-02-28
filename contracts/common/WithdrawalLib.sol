// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library WithdrawalLib {
	/// @dev Represents the information for a withdrawal operation
	/// @notice This struct is used to represent a withdrawal operation
	/// @param recipient The address of the recipient of the withdrawal
	/// @param tokenIndex The index of the token being withdrawn
	/// @param amount The amount of tokens being withdrawn
	/// @param nullifier The nullifier of the withdrawal
	struct Withdrawal {
		address recipient;
		uint32 tokenIndex;
		uint256 amount;
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
