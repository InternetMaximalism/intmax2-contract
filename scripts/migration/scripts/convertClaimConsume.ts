import { readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/devnet')
const IN_FILE = join(DATA_DIR, 'relayClaimsTransactions.json')
const OUT_FILE = join(DATA_DIR, 'relayClaimChunks.json')
const CHUNK_SIZE = 100

type TxEntry = {
	args: { period: number; users: string[] }
}

type FlatEntry = { period: number; user: string }

const chunkArray = <T>(arr: T[], size: number): T[][] => {
	const out: T[][] = []
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
	return out
}

async function main(): Promise<void> {
	/* 1) Load */
	const txs: TxEntry[] = JSON.parse(await readFile(IN_FILE, 'utf8'))

	/* 2) Flatten {period, user} */
	const flat: FlatEntry[] = txs.flatMap((tx) =>
		tx.args.users.map((u) => ({ period: tx.args.period, user: u })),
	)

	/* 3) Chunk into 100 items -> {"0":[…], "1":[…]} */
	const outJson = Object.fromEntries(
		chunkArray(flat, CHUNK_SIZE).map((c, i) => [i.toString(), c]),
	)

	/* 4) Save */
	await writeFile(OUT_FILE, JSON.stringify(outJson, null, 2))
	console.log(
		`✅  relayClaimChunks.json written  (${flat.length} records → ${Object.keys(outJson).length} chunks)`,
	)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
