// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/// @title ChainedWithdrawalLib
/// @notice Library for handling chained withdrawals in a hash chain
library ChainedWithdrawalLib {
	/// @notice Represents a withdrawal linked in a hash chain, used in withdrawal proof public inputs
	struct ChainedWithdrawal {
		address recipient; // Address of the withdrawal recipient
		uint32 tokenIndex; // Index of the token being withdrawn
		uint256 amount; // Amount of tokens being withdrawn
		bytes32 nullifier; // Nullifier to prevent double-spending
		bytes32 blockHash; // Hash of the block containing the withdrawal
		uint32 blockNumber; // Number of the block containing the withdrawal
	}

	/// @notice Hashes a ChainedWithdrawal with the previous hash in the chain
	/// @param withdrawal The ChainedWithdrawal to be hashed
	/// @param prevWithdrawalHash The hash of the previous withdrawal in the chain
	/// @return bytes32 The resulting hash
	function hashWithPrevHash(
		ChainedWithdrawal memory withdrawal,
		bytes32 prevWithdrawalHash
	) private pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					prevWithdrawalHash,
					withdrawal.recipient,
					withdrawal.tokenIndex,
					withdrawal.amount,
					withdrawal.nullifier,
					withdrawal.blockHash,
					withdrawal.blockNumber
				)
			);
	}

	/// @notice Verifies the integrity of a withdrawal hash chain
	/// @param withdrawals Array of ChainedWithdrawals to verify
	/// @param lastWithdrawalHash The expected hash of the last withdrawal in the chain
	/// @return bool True if the chain is valid, false otherwise
	function verifyWithdrawalChain(
		ChainedWithdrawal[] memory withdrawals,
		bytes32 lastWithdrawalHash
	) internal pure returns (bool) {
		bytes32 prevWithdrawalHash = 0;
		for (uint256 i = 0; i < withdrawals.length; i++) {
			ChainedWithdrawal memory withdrawal = withdrawals[i];
			prevWithdrawalHash = hashWithPrevHash(
				withdrawal,
				prevWithdrawalHash
			);
		}
		if (prevWithdrawalHash != lastWithdrawalHash) {
			return false;
		}
		return true;
	}
}
