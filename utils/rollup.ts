import { Rollup } from '../typechain-types'
import * as fs from 'fs'
import type { ContractTransactionResponse } from 'ethers'
import { ethers } from 'hardhat'

export function loadFullBlocks(): FullBlock[] {
	let fullBlocks = []
	for (let i = 1; i < 4; i++) {
		const data = fs.readFileSync(`test_data/block${i}.json`, 'utf8')
		const jsonData = JSON.parse(data) as FullBlock
		fullBlocks.push(jsonData)
	}
	return fullBlocks
}

export function loadPairingData(): PairingData {
	const data = fs.readFileSync('test_data/pairing_test_data.json', 'utf8')
	const jsonData = JSON.parse(data) as PairingData
	return jsonData
}

export async function postBlock(
	fullBlock: FullBlock,
	rollup: Rollup,
): Promise<ContractTransactionResponse> {
	if (fullBlock.signature.blockSignPayload.isRegistrationBlock) {
		if (!fullBlock.pubkeys) {
			throw new Error('pubkeys are required')
		}
		const tx = await rollup.postRegistrationBlock(
			fullBlock.signature.blockSignPayload.txTreeRoot,
			fullBlock.signature.blockSignPayload.expiry,
			fullBlock.signature.blockSignPayload.blockBuilderNonce,
			fullBlock.signature.senderFlag,
			fullBlock.signature.aggPubkey,
			fullBlock.signature.aggSignature,
			fullBlock.signature.messagePoint,
			fullBlock.pubkeys,
			{ value: ethers.parseEther('1') },
		)
		return tx
	} else {
		if (!fullBlock.accountIds) {
			throw new Error('accountIds are required')
		}
		const tx = await rollup.postNonRegistrationBlock(
			fullBlock.signature.blockSignPayload.txTreeRoot,
			fullBlock.signature.blockSignPayload.expiry,
			fullBlock.signature.blockSignPayload.blockBuilderNonce,
			fullBlock.signature.senderFlag,
			fullBlock.signature.aggPubkey,
			fullBlock.signature.aggSignature,
			fullBlock.signature.messagePoint,
			fullBlock.signature.pubkeyHash,
			'0x',
			{ value: ethers.parseEther('1') },
		)
		return tx
	}
}
