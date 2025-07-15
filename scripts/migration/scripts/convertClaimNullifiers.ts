import { readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

/* ───────── 設定 ───────── */

const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/mainnet')
const IN_FILE = join(DATA_DIR, 'allClaimNullifiers.json')
const OUT_FILE = join(DATA_DIR, 'claimChunks.json')
const CHUNK_SIZE = 100

/* ───────── 共通ユーティリティ ───────── */

const chunkArray = <T>(src: T[], size: number): T[][] => {
	const out: T[][] = []
	for (let i = 0; i < src.length; i += size) out.push(src.slice(i, i + size))
	return out
}

/* ───────── メイン ───────── */

async function main(): Promise<void> {
	/* 1) 読み込み & パース */
	const raw = JSON.parse(await readFile(IN_FILE, 'utf8')) as {
		allNullifiers: string[]
	}

	const nullifiers = raw.allNullifiers
	if (!Array.isArray(nullifiers) || nullifiers.length === 0)
		throw new Error('allNullifiers is empty or not an array')

	/* 2) 100 件ずつに分割して {"0":[…], "1":[…]} へ */
	const chunks = chunkArray(nullifiers, CHUNK_SIZE)
	const outJson = Object.fromEntries(chunks.map((c, i) => [i.toString(), c]))

	/* 3) 保存 */
	await writeFile(OUT_FILE, JSON.stringify(outJson, null, 2))
	console.log(
		`✅  claimChunks.json written  (${nullifiers.length} nullifiers → ${chunks.length} chunks)`,
	)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
