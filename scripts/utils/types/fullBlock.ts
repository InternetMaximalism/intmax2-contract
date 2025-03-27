export interface Block {
	prevBlockHash: string
	depositTreeRoot: string
	signatureHash: string
	timestamp: number
	blockNumber: number
}

export interface BlockSignPayload {
	isRegistrationBlock: boolean
	txTreeRoot: string
	expiry: number
	blockBuilderAddress: string
	blockBuilderNonce: number
}

export interface Signature {
	blockSignPayload: BlockSignPayload
	senderFlag: string
	pubkeyHash: string
	accountIdHash: string
	aggPubkey: [string, string]
	aggSignature: [string, string, string, string]
	messagePoint: [string, string, string, string]
}

export interface FullBlock {
	block: Block
	signature: Signature
	pubkeys: string[] | null
	accountIds: string | null
	blockHash: string
}
