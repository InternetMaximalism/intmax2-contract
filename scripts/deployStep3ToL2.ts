import { ethers, network } from 'hardhat'
import 'dotenv/config'
import contractAddresses from './contractAddresses.json'

const getL2MessengerAddress = () => {
	if (network.name === 'scrollsepolia') {
		return '0xBa50f5340FB9F3Bd074bD638c9BE13eCB36E603d'
	}
	if (network.name === 'localhost') {
		// provisional measures
		return ethers.ZeroAddress
	}

	//TODO scroll messenger address
	throw new Error('Unsupported network')
}

async function main() {
	const liquidityContractAddress = contractAddresses.liquidity
	if (!liquidityContractAddress) {
		throw new Error('liquidityContractAddress is not set')
	}

	const blockBuilderRegistryContractAddress =
		contractAddresses.blockBuilderRegistry
	if (!blockBuilderRegistryContractAddress) {
		throw new Error('blockBuilderRegistryContractAddress is not set')
	}

	const rollupContractAddress = contractAddresses.rollup
	if (!rollupContractAddress) {
		throw new Error('rollupContractAddress is not set')
	}
	const plonkVerifierAddress = contractAddresses.plonkVerifier
	if (!plonkVerifierAddress) {
		throw new Error('plonkVerifierAddress is not set')
	}
	const owner = (await ethers.getSigners())[0].address
	console.log('owner address', owner)

	const rollup = await ethers.getContractAt('Rollup', rollupContractAddress)
	const tx = await rollup.initialize(
		getL2MessengerAddress(),
		plonkVerifierAddress,
		liquidityContractAddress,
		blockBuilderRegistryContractAddress,
	)
	console.log('tx hash:', tx.hash)
	await tx.wait()
	console.log('Updated rollup address')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
