import { ethers } from 'hardhat'

import { type ChainedClaimLib } from '../../typechain-types/contracts/test/claim/lib/ChainedClaimLibTest'

export const getChainedClaims = (
	count: number,
): ChainedClaimLib.ChainedClaimStruct[] => {
	return Array.from({ length: count }, (_, i) => getChainedClaim(i))
}

const getChainedClaim = (num: number): ChainedClaimLib.ChainedClaimStruct => {
	return {
		recipient: ethers.Wallet.createRandom().address,
		amount: ethers.parseEther('1'),
		nullifier: ethers.randomBytes(32),
		blockHash: ethers.randomBytes(32),
		blockNumber: Math.floor(Math.random() * 100000000),
	}
}

export const getPrevHashFromClaims = (
	claims: ChainedClaimLib.ChainedClaimStruct[],
): string => {
	let prevHash = ethers.ZeroHash
	for (const claim of claims) {
		prevHash = ethers.keccak256(
			ethers.solidityPacked(
				['bytes32', 'address', 'uint256', 'bytes32', 'bytes32', 'uint32'],
				[
					prevHash,
					claim.recipient,
					claim.amount,
					claim.nullifier,
					claim.blockHash,
					claim.blockNumber,
				],
			),
		)
	}
	return prevHash
}
