import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getL2MessengerAddress } from '../utils/addressBook'
import { sleep } from '../utils/sleep'
import { getCounterPartNetwork } from '../utils/counterPartNetwork'
import { bool, cleanEnv, num, str } from 'envalid'
import { Contribution } from '../../typechain-types/contracts/Contribution'

// default values for late limiter
const fixedPointOne = 10n ** 18n
const defaultRateLimitTargetInterval = fixedPointOne * 30n // 30 seconds
const defaultRateLimitAlpha = fixedPointOne / 3n // 1/3
const defaultRateLimitK = fixedPointOne / 1000n // 0.001

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	CLAIM_PERIOD_INTERVAL: num(),
	ADMIN_PRIVATE_KEY: str({
		default: '',
	}),
	SLEEP_TIME: num({
		default: 30,
	}),
	RATELIMIT_THRESHOLD_INTERVAL: str({
		default: defaultRateLimitTargetInterval.toString(),
	}),
	RATELIMIT_ALPHA: str({
		default: defaultRateLimitAlpha.toString(),
	}),
	RATELIMIT_K: str({
		default: defaultRateLimitK.toString(),
	}),
	GRANT_ROLE: bool({
		default: false,
	}),
})

async function main() {
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
			await getL2MessengerAddress(),
			deployedL1Contracts.liquidity,
			deployedL2Contracts.l2Contribution,
			env.RATELIMIT_THRESHOLD_INTERVAL,
			env.RATELIMIT_ALPHA,
			env.RATELIMIT_K,
		)
		await tx.wait()
		console.log('Rollup initialized')
		await sleep(env.SLEEP_TIME)
	}
	if ((await withdrawal.owner()) === ethers.ZeroAddress) {
		await sleep(env.SLEEP_TIME)
		console.log('Initializing Withdrawal')
		const tx = await withdrawal.initialize(
			env.ADMIN_ADDRESS,
			await getL2MessengerAddress(),
			deployedL2Contracts.withdrawalPlonkVerifier,
			deployedL1Contracts.liquidity,
			deployedL2Contracts.rollup,
			deployedL2Contracts.l2Contribution,
			[0, 1, 2], // 0: eth, 1: itx, 2: usdc
		)
		await tx.wait()
		console.log('Withdrawal initialized')
		await sleep(env.SLEEP_TIME)
	}
	if ((await claim.owner()) === ethers.ZeroAddress) {
		await sleep(env.SLEEP_TIME)
		console.log('Initializing Claim')
		const tx = await claim.initialize(
			env.ADMIN_ADDRESS,
			await getL2MessengerAddress(),
			deployedL2Contracts.claimPlonkVerifier,
			deployedL1Contracts.liquidity,
			deployedL2Contracts.rollup,
			deployedL2Contracts.l2Contribution,
			env.CLAIM_PERIOD_INTERVAL,
		)
		await tx.wait()
		console.log('Claim initialized')
		await sleep(env.SLEEP_TIME)
	}
	if ((await registry.owner()) === ethers.ZeroAddress) {
		await sleep(env.SLEEP_TIME)
		console.log('Initializing BlockBuilderRegistry')
		const tx = await registry.initialize(env.ADMIN_ADDRESS)
		await tx.wait()
		console.log('BlockBuilderRegistry initialized')
	}

	if (env.GRANT_ROLE) {
		console.log('Granting role to l2Contribution')
		if (env.ADMIN_PRIVATE_KEY === '') {
			throw new Error('ADMIN_PRIVATE_KEY is required')
		}
		const admin = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
		if (admin.address !== env.ADMIN_ADDRESS) {
			throw new Error('ADMIN_ADDRESS and ADMIN_PRIVATE_KEY do not match')
		}
		if (!(await l2Contribution.hasRole(contributorRole, rollup))) {
			await (l2Contribution.connect(admin) as Contribution).grantRole(
				contributorRole,
				rollup,
			)
			console.log('for rollup')
		}
		if (!(await l2Contribution.hasRole(contributorRole, withdrawal))) {
			await (l2Contribution.connect(admin) as Contribution).grantRole(
				contributorRole,
				withdrawal,
			)
			console.log('for withdrawal')
		}
		if (!(await l2Contribution.hasRole(contributorRole, claim))) {
			await (l2Contribution.connect(admin) as Contribution).grantRole(
				contributorRole,
				claim,
			)
			console.log('for claim')
		}
		if (!(await l2Contribution.hasRole(contributorRole, registry))) {
			await (l2Contribution.connect(admin) as Contribution).grantRole(
				contributorRole,
				registry,
			)
			console.log('for registry')
		}
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
