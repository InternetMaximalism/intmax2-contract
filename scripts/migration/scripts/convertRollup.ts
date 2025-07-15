/**
 * index.ts
 *   - blockPostedDetailsEvents.json / depositLeafInsertedEvents.json → postTimeline.json
 *   - ethBlockNumber 昇順でタイムラインを構築。
 *   - Deposit が連続する区間は depositIndex 昇順に並べて 1 グループへ。
 */

import fs from 'fs/promises'
import { join, resolve } from 'path'

/* ───────── 型定義 ───────── */

interface BlockPostedItem {
	kind: 'BlockPosted'
	ethBlockNumber: number
	blockNumber: number // L2 block #
	prevBlockHash: string
	blockBuilder: string
	timestamp: number
	depositTreeRoot: string
	signatureHash: string
}

interface DepositGroupItem {
	kind: 'Deposits'
	ethBlockNumbers: number[] // depositIndex 昇順
	depositHashes: string[] // ↑ と同じ順
}

type TimelineItem = BlockPostedItem | DepositGroupItem

/* ───────── 入力 JSON 型 (最低限) ───────── */

type RawBlockPosted = {
	blockNumber: number
	args: {
		blockNumber: number
		prevBlockHash: string
		blockBuilder: string
		timestamp: string
		depositTreeRoot: string
		signatureHash: string
	}
}

type RawDeposit = {
	blockNumber: number
	topics: string[] // [0]=eventSig, [1]=depositIndex, [2]=depositHash
	depositIndex?: number // プロパティで来る場合も考慮
}

/* ───────── Utility ───────── */

/** topics[1] から depositIndex を BigInt で抽出 */
const getDepositIndex = (ev: RawDeposit): bigint =>
	ev.depositIndex !== undefined ? BigInt(ev.depositIndex) : BigInt(ev.topics[1])

/* ───────── タイムライン構築 ───────── */

function buildTimeline(
	blocks: RawBlockPosted[],
	deposits: RawDeposit[],
): TimelineItem[] {
	/* BlockPosted を変換 */
	const mappedBlocks: BlockPostedItem[] = blocks.map((ev) => ({
		kind: 'BlockPosted',
		ethBlockNumber: ev.blockNumber,
		blockNumber: ev.args.blockNumber,
		prevBlockHash: ev.args.prevBlockHash,
		blockBuilder: ev.args.blockBuilder,
		timestamp: Number(ev.args.timestamp),
		depositTreeRoot: ev.args.depositTreeRoot,
		signatureHash: ev.args.signatureHash,
	}))

	/* Deposit を中間型へ (depositIndex を保持) */
	type DepositRaw = {
		kind: 'DepositRaw'
		ethBlockNumber: number
		depositIndex: bigint
		depositHash: string
	}
	const mappedDeposits: DepositRaw[] = deposits.map((ev) => ({
		kind: 'DepositRaw',
		ethBlockNumber: ev.blockNumber,
		depositIndex: getDepositIndex(ev),
		depositHash: ev.topics[2] as string,
	}))

	/* ── ソート: ethBlockNumber 昇順 + (Deposit 同士なら depositIndex 昇順) */
	const combined = [...mappedBlocks, ...mappedDeposits].sort((a, b) => {
		const ea = (a as any).ethBlockNumber
		const eb = (b as any).ethBlockNumber
		if (ea !== eb) return ea - eb

		// 同じ ethBlockNumber で Deposit 同士なら depositIndex で並べ替え
		if ((a as any).kind === 'DepositRaw' && (b as any).kind === 'DepositRaw') {
			const ia = (a as DepositRaw).depositIndex
			const ib = (b as DepositRaw).depositIndex
			return ia < ib ? -1 : ia > ib ? 1 : 0
		}
		// それ以外は順不同で OK
		return 0
	})

	/* ── Deposit 連続区間をまとめる (depositIndex はすでに昇順) */
	const timeline: TimelineItem[] = []
	let buf: DepositRaw[] = []

	const flush = () => {
		if (buf.length === 0) return
		timeline.push({
			kind: 'Deposits',
			ethBlockNumbers: buf.map((d) => d.ethBlockNumber),
			depositHashes: buf.map((d) => d.depositHash),
		})
		buf = []
	}

	for (const item of combined) {
		if ((item as any).kind === 'DepositRaw') {
			buf.push(item as DepositRaw)
		} else {
			flush()
			timeline.push(item as BlockPostedItem)
		}
	}
	flush()

	return timeline
}

/* ───────── Main ───────── */

async function main() {
	const DATA_DIR = resolve(process.cwd(), 'scripts/migration/data/mainnet')
	const BLOCKS_FILE = join(DATA_DIR, 'blockPostedDetailsEvents.json')
	const DEPOSITS_FILE = join(DATA_DIR, 'depositLeafInsertedEvents.json')
	const OUT_FILE = join(DATA_DIR, 'postTimeline.json')

	const [blocksRaw, depositsRaw] = await Promise.all([
		fs.readFile(BLOCKS_FILE, 'utf8'),
		fs.readFile(DEPOSITS_FILE, 'utf8'),
	])

	const blocks: RawBlockPosted[] = JSON.parse(blocksRaw)
	const deposits: RawDeposit[] = JSON.parse(depositsRaw)

	const timeline = buildTimeline(blocks, deposits)
	await fs.writeFile(OUT_FILE, JSON.stringify(timeline, null, 2))

	console.log(`✅  timeline saved to ${OUT_FILE}`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
