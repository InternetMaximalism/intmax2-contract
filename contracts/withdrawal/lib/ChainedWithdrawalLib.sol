// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title ChainedWithdrawalLib
 * @notice Library for handling chained withdrawals in a hash chain
 * @dev Provides utilities for creating and verifying a chain of withdrawal hashes
 * used in zero-knowledge proof verification
 */
library ChainedWithdrawalLib {
	/**
	 * @notice Represents a withdrawal linked in a hash chain
	 * @dev Contains all necessary information for processing a withdrawal and verifying its inclusion in a block
	 * @param recipient The L1 address of the recipient of the withdrawal
	 * @param tokenIndex The index of the token being withdrawn
	 * @param amount The amount of tokens being withdrawn
	 * @param nullifier A unique identifier to prevent double-spending
	 * @param blockHash The hash of the L2 block containing the withdrawal
	 * @param blockNumber The number of the L2 block containing the withdrawal
	 */
	struct ChainedWithdrawal {
		address recipient;
		uint32 tokenIndex;
		uint256 amount;
		bytes32 nullifier;
		bytes32 blockHash;
		uint32 blockNumber;
	}

	/**
	 * @notice Hashes a ChainedWithdrawal with the previous hash in the chain
	 * @dev Creates a new link in the withdrawal hash chain by combining the withdrawal data with the previous hash
	 * @param withdrawal The ChainedWithdrawal to be hashed
	 * @param prevWithdrawalHash The hash of the previous withdrawal in the chain (or zero for the first withdrawal)
	 * @return bytes32 The resulting hash that forms the next link in the chain
	 */
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

	/**
	 * @notice Verifies the integrity of a withdrawal hash chain
	 * @dev Computes the hash chain from the provided withdrawals and compares it to the expected final hash
	 * @param withdrawals Array of ChainedWithdrawals to verify
	 * @param lastWithdrawalHash The expected hash of the last withdrawal in the chain (from proof public inputs)
	 * @return bool True if the computed hash chain matches the expected final hash, false otherwise
	 */
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
