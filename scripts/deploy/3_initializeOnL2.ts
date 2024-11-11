import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getL2MessengerAddress } from '../utils/addressBook'
import { sleep } from '../../utils/sleep'
import { getCounterPartNetwork } from '../utils/counterPartNetwork'

async function main() {
	const deployedL2Contracts = await readDeployedContracts()
	if (
		!deployedL2Contracts.rollup ||
		!deployedL2Contracts.withdrawal ||
		!deployedL2Contracts.blockBuilderRegistry ||
		!deployedL2Contracts.withdrawalPlonkVerifier ||
		!deployedL2Contracts.l2Contribution
	) {
		throw new Error('all l2 contracts should be deployed')
	}

	const deployedL1Contracts = await readDeployedContracts(
		getCounterPartNetwork(),
	)
	if (!deployedL1Contracts.liquidity) {
		throw new Error('liquidity should be deployed')
	}

	const l2Contribution = await ethers.getContractAt(
		'Contribution',
		deployedL2Contracts.l2Contribution,
	)
	const contributorRole = ethers.solidityPackedKeccak256(
		['string'],
		['CONTRIBUTOR'],
	)
	const rollup = await ethers.getContractAt(
		'Rollup',
		deployedL2Contracts.rollup,
	)
	const withdrawal = await ethers.getContractAt(
		'Withdrawal',
		deployedL2Contracts.withdrawal,
	)
	const registry = await ethers.getContractAt(
		'BlockBuilderRegistry',
		deployedL2Contracts.blockBuilderRegistry,
	)

	// Initialize contracts
	if ((await rollup.owner()) === ethers.ZeroAddress) {
		await sleep(10)
		console.log('Initializing Rollup')
		const tx = await rollup.initialize(
			await getL2MessengerAddress(),
			deployedL1Contracts.liquidity,
			deployedL2Contracts.l2Contribution,
		)
		await tx.wait()
		console.log('Rollup initialized')
		await sleep(10)
		await l2Contribution.grantRole(contributorRole, rollup)
		await sleep(20)
	}
	if ((await withdrawal.owner()) === ethers.ZeroAddress) {
		await sleep(10)
		console.log('Initializing Withdrawal')
		const tx = await withdrawal.initialize(
			await getL2MessengerAddress(),
			deployedL2Contracts.withdrawalPlonkVerifier,
			deployedL1Contracts.liquidity,
			deployedL2Contracts.rollup,
			deployedL2Contracts.l2Contribution,
			[0, 1, 2], // 0: eth, 1: usdc, 2: wbtc
		)
		await tx.wait()
		console.log('Withdrawal initialized')
		await sleep(10)
		await l2Contribution.grantRole(contributorRole, withdrawal)
		await sleep(20)
	}
	if ((await registry.owner()) === ethers.ZeroAddress) {
		await sleep(10)
		console.log('Initializing BlockBuilderRegistry')
		const tx = await registry.initialize()
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
