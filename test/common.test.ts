import { ethers } from 'hardhat'

export const getDepositHash = (
	depositor: string,
	recipientSaltHash: string | Uint8Array,
	amount: bigint,
	tokenIndex: number,
	isEligible: boolean,
): string => {
	const tmp = isEligible ? 1 : 0
	const packed = ethers.solidityPacked(
		['address', 'bytes32', 'uint256', 'uint32', 'uint32'],
		[depositor, recipientSaltHash, amount, tokenIndex, tmp],
	)
	const hash = ethers.keccak256(packed)
	return hash
}
