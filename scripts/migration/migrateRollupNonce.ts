import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { readFile } from 'fs/promises'
import { ethers } from 'hardhat'
import { join, resolve } from 'path'
import { Rollup } from '../../typechain-types/contracts/Rollup'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

/*───────────────────────────────────────────────────────────────────*\
  ■ JSON format
\*───────────────────────────────────────────────────────────────────*/
interface BuilderNonceRow {
	blockBuilder: string
	builderRegistrationNonce: number // uint32
	builderNonRegistrationNonce: number // uint32
}

/*───────────────────────────────────────────────────────────────────*/
async function main() {
	const deployed = await readDeployedContracts()
	if (!deployed.rollup) throw new Error('Rollup contract is not deployed on L2')

	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)

	const rollup = (await ethers.getContractAt(
		'Rollup',
		deployed.rollup,
		signer,
	)) as unknown as Rollup

	/* 2) Load JSON */
	const DATA_DIR = resolve(
		process.cwd(),
		`scripts/migration/data/${process.env.NETWORK || 'mainnet'}`,
	)
	const JSON_FILE = join(DATA_DIR, 'bockBuilderNonce.json')
	const rows: BuilderNonceRow[] = JSON.parse(await readFile(JSON_FILE, 'utf8'))

	/* 3) Generate arrays (type ethers.BigNumberish is OK) */
	const builders: string[] = []
	const regNonces: number[] = []
	const nonRegNonces: number[] = []

	for (const r of rows) {
		builders.push(r.blockBuilder)
		regNonces.push(r.builderRegistrationNonce)
		nonRegNonces.push(r.builderNonRegistrationNonce)
	}

	console.log(
		`📝 migrateBlockBuilderNonce  builders=${builders.length}  (tx pending…)`,
	)
	const tx = await rollup.migrateBlockBuilderNonce(
		builders,
		regNonces,
		nonRegNonces,
	)
	await tx.wait()
	console.log(`✅  tx mined: ${tx.hash}`)
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
