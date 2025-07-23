import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.rollup) {
		throw new Error('rollup contract should be deployed')
	}
	const newImplementationFactory = await ethers.getContractFactory('Rollup')

	const newImplementation = await newImplementationFactory.deploy()
	await newImplementation.waitForDeployment()
	console.log(
		'New Rollup implementation deployed at:',
		await newImplementation.getAddress(),
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
