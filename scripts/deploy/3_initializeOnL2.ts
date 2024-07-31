import { ethers, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getL2MessengerAddress } from '../utils/addressBook'
import { sleep } from '../../utils/sleep'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (
		!deployedContracts.rollup ||
		!deployedContracts.withdrawal ||
		!deployedContracts.blockBuilderRegistry ||
		!deployedContracts.withdrawalPlonkVerifier ||
		!deployedContracts.fraudPlonkVerifier ||
		!deployedContracts.liquidity
	) {
		throw new Error('all contracts should be deployed')
	}

	const rollup = await ethers.getContractAt('Rollup', deployedContracts.rollup)
	const withdrawal = await ethers.getContractAt(
		'Withdrawal',
		deployedContracts.withdrawal,
	)
	const registry = await ethers.getContractAt(
		'BlockBuilderRegistry',
		deployedContracts.blockBuilderRegistry,
	)

	// Initialize contracts
	if ((await rollup.owner()) === ethers.ZeroAddress) {
		await sleep(10)
		console.log('Initializing Rollup')
		const tx = await rollup.initialize(
			await getL2MessengerAddress(),
			deployedContracts.liquidity,
			deployedContracts.blockBuilderRegistry,
		)
		await tx.wait()
		console.log('Rollup initialized')
		await sleep(20)
	}
	if ((await withdrawal.owner()) === ethers.ZeroAddress) {
		await sleep(10)
		console.log('Initializing Withdrawal')
		const tx = await withdrawal.initialize(
			await getL2MessengerAddress(),
			deployedContracts.withdrawalPlonkVerifier,
			deployedContracts.liquidity,
			deployedContracts.rollup,
			[0, 1, 2], // 0: eth, 1: usdc, 2: wbtc
		)
		await tx.wait()
		console.log('Withdrawal initialized')
		await sleep(20)
	}
	if ((await registry.owner()) === ethers.ZeroAddress) {
		await sleep(10)
		console.log('Initializing BlockBuilderRegistry')
		const tx = await registry.initialize(
			deployedContracts.rollup,
			deployedContracts.fraudPlonkVerifier,
		)
		await tx.wait()
		console.log('BlockBuilderRegistry initialized')
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
