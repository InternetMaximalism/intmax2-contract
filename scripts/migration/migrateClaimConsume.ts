import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { readFile } from 'fs/promises'
import { ethers } from 'hardhat'
import { join, resolve } from 'path'

import { Claim } from '../../typechain-types/contracts/Claim'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/mainnet')
const CHUNKS_FILE = join(DATA_DIR, 'relayClaimChunks.json')

interface RelayEntry {
	period: number
	user: string
}

async function main() {
	/* 1) Claim コントラクトを owner signer で取得 */
	const deployed = await readDeployedContracts()
	if (!deployed.claim) throw new Error('Claim contract is not deployed on L2')

	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	const claim = (await ethers.getContractAt(
		'Claim',
		deployed.claim,
		signer,
	)) as unknown as Claim

	/* 2) migration 完了チェック (optional) */
	if (await claim.isMigrationCompleted()) {
		console.log('⚠️  migrateConsumeUserAllocation: already completed. Exit.')
		return
	}

	/* 3) チャンク JSON 読み込み */
	const chunksJson: Record<string, RelayEntry[]> = JSON.parse(
		await readFile(CHUNKS_FILE, 'utf8'),
	)

	const chunkIds = Object.keys(chunksJson)
		.map(Number)
		.sort((a, b) => a - b)

	const total = chunkIds.reduce((s, id) => s + chunksJson[id].length, 0)
	console.log(
		`📦 relayClaimChunks.json  (${chunkIds.length} chunks, ${total} pairs)`,
	)

	/* 4) tx 共通オプション */
	const gasLimit = 600_000 // 適宜調整
	let nonce = await ethers.provider.getTransactionCount(
		await signer.getAddress(),
	)

	/* 5) 送信ループ */
	for (const id of chunkIds) {
		const entries = chunksJson[id]
		const periods = entries.map((e) => e.period)
		const users = entries.map((e) => e.user)

		console.log(
			`🚀 migrateConsumeUserAllocation  chunk #${id}  (${entries.length} items)`,
		)

		const tx = await claim.migrateConsumeUserAllocation(periods, users, {
			gasLimit,
			nonce: nonce++,
		})
		await tx.wait()

		console.log(`   ↳ mined ${tx.hash}`)
	}

	console.log('🎉  Consume-allocation migration completed.')
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
