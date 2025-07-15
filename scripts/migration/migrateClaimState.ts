import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'
import { Claim } from '../../typechain-types/contracts/Claim'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

async function main() {
	let deployedL2Contracts = await readDeployedContracts()
	if (!deployedL2Contracts.claim) {
		throw new Error('Claim contract is not deployed on L2')
	}
	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	const claim = (await ethers.getContractAt(
		'Claim',
		deployedL2Contracts.claim,
		signer,
	)) as unknown as Claim
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
