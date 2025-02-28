import { ethers, upgrades, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

if (network.name !== 'scrollSepolia') {
	throw new Error('This script should be run on scrollSepolia network')
}

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.claim) {
		throw new Error('claim contract should be deployed')
	}

	const newImplementationFactory = await ethers.getContractFactory('Claim')
	await newImplementationFactory.deploy()

	// await upgrades.forceImport(deployedContracts.claim, newImplementationFactory)

	await upgrades.upgradeProxy(deployedContracts.claim, newImplementationFactory)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
