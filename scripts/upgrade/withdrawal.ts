import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.withdrawal) {
		throw new Error('withdrawal contract should be deployed')
	}
	const newImplementationFactory = await ethers.getContractFactory('Withdrawal')

	const newImplementation = await newImplementationFactory.deploy()
	await newImplementation.waitForDeployment()
	console.log(
		'New Withdrawal implementation deployed at:',
		await newImplementation.getAddress(),
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
