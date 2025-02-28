interface FullBlock {
	block: Block
	signature: Signature
	pubkeys: string[] | null
	accountIds: string | null
	blockHash: string
}

interface Block {
	prevBlockHash: string
	depositTreeRoot: string
	signatureHash: string
	blockNumber: number
}

interface Signature {
	isRegistrationBlock: boolean
	txTreeRoot: string
	expiry: string
	senderFlag: string
	pubkeyHash: string
	accountIdHash: string
	aggPubkey: [string, string]
	aggSignature: [string, string, string, string]
	messagePoint: [string, string, string, string]
}
