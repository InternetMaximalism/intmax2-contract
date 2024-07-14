import { ethers, upgrades, network } from 'hardhat'
import 'dotenv/config'
import contractAddresses from './contractAddresses.json'
import { saveJsonToFile } from './utils/saveJsonToFile'

async function main() {
	let newContractAddresses: { [contractName: string]: string } =
		contractAddresses

	let rollupContractAddress = (newContractAddresses as any).rollup
	if (!rollupContractAddress) {
		const rollupFactory = await ethers.getContractFactory('Rollup')
		// The execution of initialize will be done later.
		const rollup = await upgrades.deployProxy(rollupFactory, [], {
			initializer: false,
			kind: 'uups',
		})
		rollupContractAddress = await rollup.getAddress()
		console.log('Rollup deployed to:', rollupContractAddress)

		newContractAddresses = {
			...newContractAddresses,
			rollup: rollupContractAddress,
		}

		saveJsonToFile(
			'./scripts/contractAddresses.json',
			JSON.stringify(newContractAddresses, null, 2),
		)
	}

	const blockBuilderRegistryFactory = await ethers.getContractFactory(
		'BlockBuilderRegistry',
	)
	const blockBuilderRegistry = await upgrades.deployProxy(
		blockBuilderRegistryFactory,
		[rollupContractAddress],
		{ kind: 'uups' },
	)
	const blockBuilderRegistryContractAddress =
		await blockBuilderRegistry.getAddress()
	console.log(
		'Block Builder Registry deployed to:',
		blockBuilderRegistryContractAddress,
	)

	newContractAddresses = {
		...newContractAddresses,
		blockBuilderRegistry: blockBuilderRegistryContractAddress,
	}

	saveJsonToFile(
		'./scripts/contractAddresses.json',
		JSON.stringify(newContractAddresses, null, 2),
	)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
