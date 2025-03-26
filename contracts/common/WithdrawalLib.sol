// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title WithdrawalLib
 * @notice Library for handling withdrawal operations and data structures
 * @dev Provides utilities for working with withdrawals in the Intmax2 protocol
 */
library WithdrawalLib {
	/**
	 * @notice Represents a withdrawal operation in the Intmax2 protocol
	 * @dev Contains all necessary information to process a withdrawal from L2 to L1
	 * @param recipient The L1 address of the recipient of the withdrawal
	 * @param tokenIndex The index of the token being withdrawn
	 * @param amount The amount of tokens being withdrawn
	 * @param nullifier A unique identifier to prevent double-spending, derived from the withdrawal note
	 */
	struct Withdrawal {
		address recipient;
		uint32 tokenIndex;
		uint256 amount;
		bytes32 nullifier;
	}

	/**
	 * @notice Calculates the hash of a Withdrawal struct
	 * @dev Uses keccak256 to hash the packed encoding of all withdrawal fields
	 * @param withdrawal The Withdrawal struct to be hashed
	 * @return bytes32 The calculated hash of the Withdrawal, used for verification
	 */
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
