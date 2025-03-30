import { ethers } from 'hardhat'
import type {
	Claim,
	ClaimInfo,
	ClaimProofPublicInputs,
} from './types/claimInfo'

export function makeClaimInfo(aggregator: string, claims: Claim[]): ClaimInfo {
	let hash = ethers.ZeroHash
	for (const claim of claims) {
		hash = hashClaimWithPrevHash(hash, claim)
	}
	const pis = {
		lastClaimHash: hash,
		claimAggregator: aggregator,
	}
	const pisHash = hashClaimPis(pis)
	return {
		claims: claims,
		claimProofPublicInputs: pis,
		pisHash,
	}
}

function hashClaimWithPrevHash(prevHash: string, claim: Claim): string {
	return ethers.solidityPackedKeccak256(
		['bytes32', 'address', 'uint256', 'bytes32', 'bytes32', 'uint32'],
		[
			prevHash,
			claim.recipient,
			claim.amount,
			claim.nullifier,
			claim.blockHash,
			claim.blockNumber,
		],
	)
}

function hashClaimPis(pis: ClaimProofPublicInputs): string {
	return ethers.solidityPackedKeccak256(
		['bytes32', 'address'],
		[pis.lastClaimHash, pis.claimAggregator],
	)
}
