/**
 * scripts/migration/runNullifierMigration.ts
 *
 * claimChunks.json を読み込み、チャンクごとに
 *   Claim.migrateNullifiers(bytes32[])
 * を送信する。
 *
 *   $ npx hardhat run scripts/migration/runNullifierMigration.ts --network <network>
 */

import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { readFile } from 'fs/promises'
import { ethers } from 'hardhat'
import { join, resolve } from 'path'

import { Claim } from '../../typechain-types/contracts/Claim'
import { readDeployedContracts } from '../utils/io'

/*───────────────────────────────────*\
  ■ env: ADMIN_PRIVATE_KEY 必須
\*───────────────────────────────────*/
const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

/*───────────────────────────────────*\
  ■ 既存 main に追記
\*───────────────────────────────────*/
async function main() {
	/* 0) コントラクトアドレスを取得 */
	const deployedL2Contracts = await readDeployedContracts()
	if (!deployedL2Contracts.claim) {
		throw new Error('Claim contract is not deployed on L2')
	}

	/* 1) owner signer */
	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)

	const claim = (await ethers.getContractAt(
		'Claim',
		deployedL2Contracts.claim,
		signer,
	)) as unknown as Claim

	/* 2) migration 状態チェック (optional) */
	const isDone = await claim.isMigrationCompleted()
	if (isDone) {
		console.log('⚠️  migrateNullifiers: already completed. Exit.')
		return
	}

	/* 3) チャンク JSON を読み込み */
	const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/mainnet')
	const CHUNKS_FILE = join(DATA_DIR, 'claimChunks.json')
	const chunksJson: Record<string, string[]> = JSON.parse(
		await readFile(CHUNKS_FILE, 'utf8'),
	)

	const chunkIds = Object.keys(chunksJson)
		.map(Number)
		.sort((a, b) => a - b)

	console.log(
		`📦 claimChunks.json loaded  (${chunkIds.length} chunks, ${chunkIds.reduce(
			(sum, id) => sum + chunksJson[id].length,
			0,
		)} nullifiers)`,
	)

	/* 4) tx 共通オプション */
	let nonce = await ethers.provider.getTransactionCount(
		await signer.getAddress(),
	)

	/* 5) 送信ループ */
	for (const id of chunkIds) {
		const chunk = chunksJson[id]
		console.log(`🚀 migrateNullifiers  chunk #${id}  (${chunk.length} items)`)

		const tx = await claim.migrateNullifiers(chunk, {
			nonce: nonce++,
		})
		await tx.wait()

		console.log(`   ↳ mined  ${tx.hash}`)
	}

	console.log('🎉  Nullifier migration completed.')
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
