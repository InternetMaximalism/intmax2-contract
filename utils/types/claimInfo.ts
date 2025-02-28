interface ClaimInfo {
	claims: Claim[]
	claimProofPublicInputs: ClaimProofPublicInputs
	pisHash: string
}

interface Claim {
	recipient: string
	amount: string
	nullifier: string
	blockHash: string
	blockNumber: number
}

interface ClaimProofPublicInputs {
	lastClaimHash: string
	claimAggregator: string
}
