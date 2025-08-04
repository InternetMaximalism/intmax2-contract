import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'
import { Liquidity } from '../../typechain-types/contracts/Liquidity'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

async function main() {
	if (!env.ADMIN_PRIVATE_KEY) {
		throw new Error('ADMIN_PRIVATE_KEY is not set in the environment variables')
	}

	const deployed = await readDeployedContracts()

	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	if (!deployed.liquidity)
		throw new Error('Liquidity contract is not deployed on L1s')

	const liquidity = (await ethers.getContractAt(
		'Liquidity',
		deployed.liquidity,
		signer,
	)) as unknown as Liquidity

	const newImplementationFactory = await ethers.getContractFactory('Liquidity')
	const newImplementation = await newImplementationFactory.deploy()
	await newImplementation.waitForDeployment()

	console.log(
		`New Liquidity implementation deployed at ${await newImplementation.getAddress()}`,
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
