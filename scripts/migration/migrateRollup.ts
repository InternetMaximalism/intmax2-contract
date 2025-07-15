import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'
import { Rollup } from '../../typechain-types/contracts/Rollup'
import { readDeployedContracts } from '../utils/io'

import { readFile } from 'fs/promises'
import { join, resolve } from 'path'

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
	blockBuilder: string // address
	timestamp: number // uint64
	depositTreeRoot: string
	signatureHash: string
}

type TimelineItem = DepositsItem | BlockPostedItem

async function main() {
	const deployed = await readDeployedContracts()
	if (!deployed.rollup) throw new Error('Rollup contract is not deployed on L2')

	/** owner signer */
	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)

	const rollup = (await ethers.getContractAt(
		'Rollup',
		deployed.rollup,
		signer,
	)) as unknown as Rollup

	/* 2) タイムライン JSON を読み込み */
	const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/mainnet')
	const TIMELINE_FILE = join(DATA_DIR, 'postTimeline.json')
	const timelineRaw = await readFile(TIMELINE_FILE, 'utf8')
	const timeline: TimelineItem[] = JSON.parse(timelineRaw)

	console.log(
		`📋 Timeline loaded: ${timeline.length} items  (Deposits ${
			timeline.filter((x) => x.kind === 'Deposits').length
		}, BlockPosted ${timeline.filter((x) => x.kind === 'BlockPosted').length})`,
	)

	/* 3) 順に実行 */
	for (const item of timeline) {
		if (item.kind === 'Deposits') {
			console.log(
				`🟢 migrateDeposits  hashes=${item.depositHashes.length}  ethBlocks=[${item.ethBlockNumbers.join(
					',',
				)}]`,
			)
			const tx = await rollup.migrateDeposits(item.depositHashes, 0)
			await tx.wait()
			console.log(`   ↳ tx mined: ${tx.hash}`)
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
			)
			await tx.wait()
			console.log(`   ↳ tx mined: ${tx.hash}`)
		}
	}

	console.log('🎉  Migration completed successfully')
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
