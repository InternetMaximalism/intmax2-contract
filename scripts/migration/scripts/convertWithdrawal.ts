import { readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/devnet')
const CLAIMABLE_FILE = join(DATA_DIR, 'claimableWithdrawalQueuedEvents.json')
const DIRECT_FILE = join(DATA_DIR, 'directWithdrawalQueuedEvents.json')
const OUT_FILE = join(DATA_DIR, 'withdrawalChunks.json')
const CHUNK_SIZE = 100

type RawEvent = {
	blockNumber: number // used for sorting
	args: {
		withdrawal: {
			nullifier: string
			recipient: string
			tokenIndex: number
			amount: string
		}
	}
}

type Withdrawal = {
	nullifier: string
	recipient: string
	tokenIndex: number
	amount: string
}

const chunkArray = <T>(src: T[], size: number): T[][] => {
	const out: T[][] = []
	for (let i = 0; i < src.length; i += size) out.push(src.slice(i, i + size))
	return out
}

async function main() {
	/* 1) Load and merge 2 files */
	const [claimableRaw, directRaw] = await Promise.all([
		readFile(CLAIMABLE_FILE, 'utf8'),
		readFile(DIRECT_FILE, 'utf8'),
	])

	const events: RawEvent[] = [
		...JSON.parse(claimableRaw),
		...JSON.parse(directRaw),
	]

	/* 2) Sort by block number ascending and extract withdrawal */
	const withdrawals: Withdrawal[] = events
		.sort((a, b) => a.blockNumber - b.blockNumber)
		.map((e) => e.args.withdrawal)

	/* 3) Chunk into 100 items each → {"0":[...], "1":[...]} format */
	const chunks = chunkArray(withdrawals, CHUNK_SIZE)
	const outJson = Object.fromEntries(chunks.map((c, i) => [i.toString(), c]))

	/* 4) Save */
	await writeFile(OUT_FILE, JSON.stringify(outJson, null, 2))
	console.log(
		`✅  ${OUT_FILE} written  (total ${withdrawals.length} withdrawals → ${chunks.length} chunks)`,
	)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
