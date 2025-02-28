import { ethers, upgrades, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

if (network.name !== 'sepolia') {
	throw new Error('This script should be run on sepolia network')
}

async function main() {
	// const newImplementationFactory = await ethers.getContractFactory('Liquidity')
	// const _liquidity = await newImplementationFactory.deploy()
	// const newImplAddress = await _liquidity.getAddress()
	// console.log('New Liquidity deployed to:', newImplAddress)

	const newImplAddress = '0x52F3EA96f190ddf1e69B0a84296E4A9d8806b148'
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.liquidity) {
		throw new Error('liquidity contract should be deployed')
	}
	const liquidity = await ethers.getContractAt(
		'Liquidity',
		deployedContracts.liquidity,
	)
	const tx = await liquidity.upgradeToAndCall(newImplAddress, '0x')
	console.log('Upgrade tx:', tx.hash)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
