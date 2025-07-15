import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { readFile } from 'fs/promises'
import { ethers } from 'hardhat'
import { join, resolve } from 'path'

import { Rollup } from '../../typechain-types/contracts/Rollup'
import { readDeployedContracts } from '../utils/io'

const DATA_DIR = resolve(
	process.cwd(),
	`scripts/migration/data/${process.env.NETWORK || 'mainnet'}`,
)

console.log(`DATA_DIR: ${DATA_DIR}`)

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

interface DepositsItem {
	kind: 'Deposits'
	ethBlockNumbers: number[]
	depositHashes: string[]
}

interface BlockPostedItem {
	kind: 'BlockPosted'
	ethBlockNumber: number
	blockNumber: number
	prevBlockHash: string
	blockBuilder: string
	timestamp: number
	depositTreeRoot: string
	signatureHash: string
}

type TimelineItem = DepositsItem | BlockPostedItem

async function main() {
	const deployed = await readDeployedContracts()
	if (!deployed.rollup) throw new Error('Rollup contract is not deployed on L2')

	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	let nonce = await ethers.provider.getTransactionCount(
		await signer.getAddress(),
	)

	const rollup = (await ethers.getContractAt(
		'Rollup',
		deployed.rollup,
		signer,
	)) as unknown as Rollup

	const timeline: TimelineItem[] = JSON.parse(
		await readFile(join(DATA_DIR, 'postTimeline.json'), 'utf8'),
	)

	console.log(
		`📋 Timeline loaded: ${timeline.length} items  (Deposits ${
			timeline.filter((x) => x.kind === 'Deposits').length
		}, BlockPosted ${timeline.filter((x) => x.kind === 'BlockPosted').length})`,
	)

	const gasLimitDeposits = 10_000_000
	const gasLimitBlockPost = 5_000_000

	for (const item of timeline) {
		if (item.kind === 'Deposits') {
			console.log(
				`🟢 migrateDeposits  hashes=${item.depositHashes.length}  ethBlocks=[${item.ethBlockNumbers.join(
					',',
				)}]`,
			)

			const tx = await rollup.migrateDeposits(item.depositHashes, {
				gasLimit: gasLimitDeposits,
				nonce: nonce++,
			})
			await tx.wait()
			console.log(`   ↳ mined  ${tx.hash}`)
		} else {
			console.log(
				`🔵 migrateBlockPost  L2#${item.blockNumber}  ethBlock=${item.ethBlockNumber}`,
			)

			const tx = await rollup.migrateBlockPost(
				item.prevBlockHash,
				item.blockBuilder,
				item.timestamp,
				item.blockNumber,
				item.depositTreeRoot,
				item.signatureHash,
				{
					gasLimit: gasLimitBlockPost,
					nonce: nonce++,
				},
			)
			await tx.wait()
			console.log(`   ↳ mined  ${tx.hash}`)
		}
	}

	console.log('🎉  Migration completed successfully')
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
