import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { readFile } from 'fs/promises'
import { ethers } from 'hardhat'
import { join, resolve } from 'path'

import { Claim } from '../../typechain-types/contracts/Claim'
import { readDeployedContracts } from '../utils/io'

/* ───────────────── env ───────────────── */

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

async function main() {
	/* 0) Claim コントラクト */
	const deployedL2Contracts = await readDeployedContracts()
	if (!deployedL2Contracts.claim)
		throw new Error('Claim contract is not deployed on L2')

	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	const claim = (await ethers.getContractAt(
		'Claim',
		deployedL2Contracts.claim,
		signer,
	)) as unknown as Claim

	/* 1) contributionChunks.json 読み込み */
	const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/mainnet')
	const CHUNKS_FILE = join(DATA_DIR, 'contributionChunks.json')
	const chunksJson: Record<
		string,
		{ period: number; recipient: string; depositAmount: string }[]
	> = JSON.parse(await readFile(CHUNKS_FILE, 'utf8'))

	const chunkIds = Object.keys(chunksJson)
		.map(Number)
		.sort((a, b) => a - b)

	console.log(
		`📦 contributionChunks.json loaded  (${chunkIds.length} chunks, ${chunkIds.reduce(
			(s, id) => s + chunksJson[id].length,
			0,
		)} contributions)`,
	)

	/* 2) tx パラメータ */
	let nonce = await ethers.provider.getTransactionCount(
		await signer.getAddress(),
	)

	/* 3) チャンクごとに migrateContributions 実行 */
	for (const id of chunkIds) {
		const entries = chunksJson[id]

		const periodNumbers = entries.map((e) => e.period)
		const users = entries.map((e) => e.recipient)
		const depositAmounts = entries.map((e) => e.depositAmount)

		console.log(
			`🚀 migrateContributions  chunk #${id}  (${entries.length} items)`,
		)

		const tx = await claim.migrateContributions(
			periodNumbers,
			users,
			depositAmounts,
			{ nonce: nonce++ },
		)
		await tx.wait()
		console.log(`   ↳ mined ${tx.hash}`)
	}

	console.log('🎉  Contribution migration completed.')
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
