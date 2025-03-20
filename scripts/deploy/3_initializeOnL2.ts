import { ethers, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { sleep } from '../../utils/sleep'
import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	SLEEP_TIME: num({
		default: 10,
	}),
})

async function main() {
	let admin = env.ADMIN_ADDRESS
	if (network.name === 'localhost') {
		admin = (await ethers.getSigners())[0].address
	}

	const deployedL2Contracts = await readDeployedContracts()
	if (
		!deployedL2Contracts.rollup ||
		!deployedL2Contracts.withdrawal ||
		!deployedL2Contracts.claim ||
		!deployedL2Contracts.blockBuilderRegistry ||
		!deployedL2Contracts.withdrawalPlonkVerifier ||
		!deployedL2Contracts.claimPlonkVerifier ||
		!deployedL2Contracts.l2Contribution
	) {
		throw new Error('all l2 contracts should be deployed')
	}

	const deployedL1Contracts = await readDeployedContracts()
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
	const claim = await ethers.getContractAt('Claim', deployedL2Contracts.claim)
	const registry = await ethers.getContractAt(
		'BlockBuilderRegistry',
		deployedL2Contracts.blockBuilderRegistry,
	)

	// Initialize contracts
	if ((await rollup.owner()) === ethers.ZeroAddress) {
		await sleep(env.SLEEP_TIME)
		console.log('Initializing Rollup')
		const tx = await rollup.initialize(
			env.ADMIN_ADDRESS,
			deployedL1Contracts.liquidity,
			deployedL2Contracts.l2Contribution,
		)
		await tx.wait()
		console.log('Rollup initialized')
		await sleep(env.SLEEP_TIME)
		await l2Contribution.grantRole(contributorRole, rollup)
		await sleep(env.SLEEP_TIME)
	}
	if ((await withdrawal.owner()) === ethers.ZeroAddress) {
		await sleep(env.SLEEP_TIME)
		console.log('Initializing Withdrawal')
		const tx = await withdrawal.initialize(
			admin,
			deployedL2Contracts.withdrawalPlonkVerifier,
			deployedL1Contracts.liquidity,
			deployedL2Contracts.rollup,
			deployedL2Contracts.l2Contribution,
			[0, 1, 2], // 0: eth, 1: itx, 2: usdc
		)
		await tx.wait()
		console.log('Withdrawal initialized')
		await sleep(env.SLEEP_TIME)
		await l2Contribution.grantRole(contributorRole, withdrawal)
		await sleep(env.SLEEP_TIME)
	}
	if ((await claim.owner()) === ethers.ZeroAddress) {
		await sleep(env.SLEEP_TIME)
		console.log('Initializing Claim')
		const tx = await claim.initialize(
			admin,
			deployedL2Contracts.claimPlonkVerifier,
			deployedL1Contracts.liquidity,
			deployedL2Contracts.rollup,
			deployedL2Contracts.l2Contribution,
		)
		await tx.wait()
		console.log('Claim initialized')
		await sleep(env.SLEEP_TIME)
		await l2Contribution.grantRole(contributorRole, claim)
		await sleep(env.SLEEP_TIME)
	}
	if ((await registry.owner()) === ethers.ZeroAddress) {
		await sleep(env.SLEEP_TIME)
		console.log('Initializing BlockBuilderRegistry')
		const tx = await registry.initialize(admin)
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
