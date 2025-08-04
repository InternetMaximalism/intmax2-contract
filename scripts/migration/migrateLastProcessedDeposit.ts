import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'

import { Rollup } from '../../typechain-types/contracts/Rollup'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

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

	// const lastProcessedDepositId = 3723
	const lastProcessedDepositId = 710
	const tx = await rollup.migrateLastProcessedDepositId(lastProcessedDepositId)
	console.log(
		`📦 migrateLastProcessedDepositId: tx sent (hash: ${tx.hash}, nonce: ${nonce})`,
	)
	await tx.wait()
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
