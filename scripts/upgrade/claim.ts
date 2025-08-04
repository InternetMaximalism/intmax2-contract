import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.claim) {
		throw new Error('claim contract should be deployed')
	}
	const newImplementationFactory = await ethers.getContractFactory('Claim')

	const newImplementation = await newImplementationFactory.deploy()
	await newImplementation.waitForDeployment()
	console.log(
		'New Claim implementation deployed at:',
		await newImplementation.getAddress(),
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
