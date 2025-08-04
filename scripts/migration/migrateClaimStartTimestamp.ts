import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'

import { Claim } from '../../typechain-types/contracts/Claim'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

async function main() {
	/* 0) Get contract address */
	const deployedL2Contracts = await readDeployedContracts()
	if (!deployedL2Contracts.claim) {
		throw new Error('Claim contract is not deployed on L2')
	}

	/* 1) owner signer */
	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)

	const claim = (await ethers.getContractAt(
		'Claim',
		deployedL2Contracts.claim,
		signer,
	)) as unknown as Claim

	const startTimestamp = 1750464000
	// const startTimestamp = 1748052000

	const tx = await claim.migrateStartTimestamp(startTimestamp)
	await tx.wait()
	console.log(
		`✅ migrateClaimStartTimestamp: completed (startTimestamp: ${startTimestamp})`,
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
