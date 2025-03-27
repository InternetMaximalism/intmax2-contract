export interface ClaimInfo {
	claims: Claim[]
	claimProofPublicInputs: ClaimProofPublicInputs
	pisHash: string
}

export interface Claim {
	recipient: string
	amount: string
	nullifier: string
	blockHash: string
	blockNumber: number
}

export interface ClaimProofPublicInputs {
	lastClaimHash: string
	claimAggregator: string
}
