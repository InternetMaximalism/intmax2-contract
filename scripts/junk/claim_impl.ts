import { ethers, upgrades, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

async function main() {
	const newImplementationFactory = await ethers.getContractFactory('Claim')
	const _claim = await newImplementationFactory.deploy()
	const newImplAddress = await _claim.getAddress()
	console.log('New Liquidity deployed to:', newImplAddress)

	// sleep 30 seconds
	await new Promise((resolve) => setTimeout(resolve, 30000))

	// const newImplAddress = '0xE669a17304d2D05E94FDA2892EDBE7FA8904b28e'
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.claim) {
		throw new Error('claim contract should be deployed')
	}
	const claim = await ethers.getContractAt('Claim', deployedContracts.claim)
	const tx = await claim.upgradeToAndCall(newImplAddress, '0x')
	console.log('Upgrade tx:', tx.hash)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
