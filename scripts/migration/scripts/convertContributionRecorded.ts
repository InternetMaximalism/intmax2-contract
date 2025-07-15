import { readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

/*───────────────────────────────*
 * Configuration
 *───────────────────────────────*/
const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/mainnet')
const IN_FILE = join(DATA_DIR, 'contributionRecordedEvents.json')
const OUT_FILE = join(DATA_DIR, 'contributionChunks.json')
const CHUNK_SIZE = 100

type RawEvent = {
	blockNumber: number // for sorting
	args: {
		period: number
		recipient: string
		depositAmount: string
	}
}

type Contribution = {
	period: number
	recipient: string
	depositAmount: string
}

const chunkArray = <T>(arr: T[], size: number): T[][] => {
	const out: T[][] = []
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
	return out
}

async function main(): Promise<void> {
	/* 1) Load JSON */
	const events: RawEvent[] = JSON.parse(await readFile(IN_FILE, 'utf8'))

	/* 2) Sort by block number ascending and extract required fields */
	const contributions: Contribution[] = events
		.sort((a, b) => a.blockNumber - b.blockNumber)
		.map((ev) => ({
			period: ev.args.period,
			recipient: ev.args.recipient,
			depositAmount: ev.args.depositAmount,
		}))

	/* 3) Chunk into 100 items each and convert to {"0":[…], "1":[…]} */
	const chunked = Object.fromEntries(
		chunkArray(contributions, CHUNK_SIZE).map((c, i) => [i.toString(), c]),
	)

	/* 4) Save */
	await writeFile(OUT_FILE, JSON.stringify(chunked, null, 2))
	console.log(
		`✅  contributionChunks.json written  (${contributions.length} records → ${Object.keys(chunked).length} chunks)`,
	)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
