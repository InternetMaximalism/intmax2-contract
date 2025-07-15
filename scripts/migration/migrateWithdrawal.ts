import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { readFile } from 'fs/promises'
import { ethers } from 'hardhat'
import { join, resolve } from 'path'

import { Withdrawal } from '../../typechain-types/contracts/Withdrawal'
import { readDeployedContracts } from '../utils/io'

const DATA_DIR = resolve(
	process.cwd(),
	`scripts/migration/data/${process.env.NETWORK || 'mainnet'}`,
)
console.log(`DATA_DIR: ${DATA_DIR}`)

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

type WithdrawalStruct = {
	nullifier: string
	recipient: string
	tokenIndex: number
	amount: string
}

async function main() {
	/* 1) Get contract address */
	const deployed = await readDeployedContracts()
	if (!deployed.withdrawal)
		throw new Error('Withdrawal contract is not deployed on L2')

	/* 2) signer (owner) */
	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	const withdrawal = (await ethers.getContractAt(
		'Withdrawal',
		deployed.withdrawal,
		signer,
	)) as unknown as Withdrawal

	const CHUNKS_FILE = join(DATA_DIR, 'withdrawalChunks.json')
	const chunksJson: Record<string, WithdrawalStruct[]> = JSON.parse(
		await readFile(CHUNKS_FILE, 'utf8'),
	)

	const chunkIds = Object.keys(chunksJson)
		.map(Number)
		.sort((a, b) => a - b)

	console.log(
		`📦 withdrawalChunks.json loaded  (${chunkIds.length} chunks, ${chunkIds.reduce(
			(sum, id) => sum + chunksJson[id].length,
			0,
		)} withdrawals)`,
	)

	/* 5) Common tx options */
	let nonce = await ethers.provider.getTransactionCount(
		await signer.getAddress(),
	)

	/* 6) Send loop */
	for (const id of chunkIds) {
		const chunk = chunksJson[id]
		console.log(`🚀 migrateWithdrawals  chunk #${id}  (${chunk.length} items)`)

		const tx = await withdrawal.migrateWithdrawals(chunk, {
			nonce: nonce++,
		})
		await tx.wait()

		console.log(`   ↳ mined  ${tx.hash}`)
	}

	console.log('🎉  Withdrawal migration completed.')
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
