// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

library DepositLib {
	/// @dev Represents a leaf in the Deposit tree
	/// @notice This struct is used to represent a deposit in the Deposit tree
	/// @param depositor The address of the depositor
	/// @param recipientSaltHash The hash of the recipient's intmax2 address and a private salt
	/// @param amount The amount of tokens being deposited
	/// @param tokenIndex The index of the token being deposited
	/// @param isEligible Whether the deposit is eligible for mining rewards
	struct Deposit {
		address depositor;
		bytes32 recipientSaltHash;
		uint256 amount;
		uint32 tokenIndex;
		bool isEligible;
	}

	/// @notice Calculates the hash of a Deposit struct
	/// @param deposit The Deposit struct to be hashed
	/// @return bytes32 The calculated hash of the Deposit
	function getHash(Deposit memory deposit) internal pure returns (bytes32) {
		return
			keccak256(
				abi.encodePacked(
					deposit.depositor,
					deposit.recipientSaltHash,
					deposit.amount,
					deposit.tokenIndex,
					uint32(deposit.isEligible ? 1 : 0)
				)
			);
	}
}
