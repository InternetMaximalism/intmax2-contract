import { bool, cleanEnv, num, str } from 'envalid'
import { ethers, upgrades } from 'hardhat'
import { getL2MessengerAddress } from '../utils/addressBook'
import { getCounterPartNetwork } from '../utils/counterPartNetwork'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import { sleep } from '../utils/sleep'

const fixedPointOne = 10n ** 18n
const defaultRateLimitTargetInterval = fixedPointOne * 30n // 30 seconds
const defaultRateLimitAlpha = fixedPointOne / 3n // 1/3
const defaultRateLimitK = fixedPointOne / 1000n // 0.001

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	CONTRIBUTION_PERIOD_INTERVAL: num(),
	SLEEP_TIME: num({
		default: 30,
	}),
	DEPLOY_MOCK_MESSENGER: bool({
		default: false,
	}),
	PLONK_VERIFIER_TYPE: str({
		choices: ['mock', 'faster-mining', 'normal'],
		default: 'normal',
	}),
	CLAIM_PERIOD_INTERVAL: num(),
	ADMIN_PRIVATE_KEY: str({
		default: '',
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
	let deployedL2Contracts = await readDeployedContracts()
	let deployedL1Contracts = await readDeployedContracts(getCounterPartNetwork())

	if (!deployedL2Contracts.rollup) {
		console.log('deploying rollup')
		const rollupFactory = await ethers.getContractFactory('Rollup')
		const rollup = await upgrades.deployProxy(
			rollupFactory,
			[
				env.ADMIN_ADDRESS,
				await getL2MessengerAddress(),
				deployedL1Contracts.liquidity,
				deployedL2Contracts.l2Contribution,
				env.RATELIMIT_THRESHOLD_INTERVAL,
				env.RATELIMIT_ALPHA,
				env.RATELIMIT_K,
			],
			{
				kind: 'uups',
			},
		)
		const deployedContracts = await readDeployedContracts()
		deployedL2Contracts = {
			rollup: await rollup.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(deployedL2Contracts)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedL2Contracts.blockBuilderRegistry) {
		console.log('deploying blockBuilderRegistry')
		const blockBuilderRegistryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistry',
		)
		const blockBuilderRegistry = await upgrades.deployProxy(
			blockBuilderRegistryFactory,
			[env.ADMIN_ADDRESS],
			{
				kind: 'uups',
			},
		)
		const deployedContracts = await readDeployedContracts()
		deployedL2Contracts = {
			blockBuilderRegistry: await blockBuilderRegistry.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(deployedL2Contracts)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedL2Contracts.withdrawal) {
		console.log('deploying withdrawal')
		const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
		const withdrawal = await upgrades.deployProxy(
			withdrawalFactory,
			[
				env.ADMIN_ADDRESS,
				await getL2MessengerAddress(),
				deployedL2Contracts.withdrawalPlonkVerifier,
				deployedL1Contracts.liquidity,
				deployedL2Contracts.rollup,
				deployedL2Contracts.l2Contribution,
				[0, 1, 2, 3], // 0: eth, 1: intmax token, 2: wbtc, 3: usdc
			],
			{
				kind: 'uups',
			},
		)
		const deployedContracts = await readDeployedContracts()
		deployedL2Contracts = {
			withdrawal: await withdrawal.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(deployedL2Contracts)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedL2Contracts.claim) {
		console.log('deploying claim')
		const claimFactory = await ethers.getContractFactory('Claim')
		const claim = await upgrades.deployProxy(
			claimFactory,
			[
				env.ADMIN_ADDRESS,
				await getL2MessengerAddress(),
				deployedL2Contracts.claimPlonkVerifier,
				deployedL1Contracts.liquidity,
				deployedL2Contracts.rollup,
				deployedL2Contracts.l2Contribution,
				env.CLAIM_PERIOD_INTERVAL,
			],
			{
				kind: 'uups',
			},
		)
		const deployedContracts = await readDeployedContracts()
		deployedL2Contracts = {
			claim: await claim.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(deployedL2Contracts)
		await sleep(env.SLEEP_TIME)
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
