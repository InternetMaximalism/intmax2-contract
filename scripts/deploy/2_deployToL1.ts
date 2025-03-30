import { ethers, upgrades } from 'hardhat'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import { getL1MessengerAddress } from '../utils/addressBook'
import { sleep } from '../utils/sleep'
import { getCounterPartNetwork } from '../utils/counterPartNetwork'
import { bool, cleanEnv, num, str } from 'envalid'
import { Contribution } from '../../typechain-types/contracts/Contribution'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	RELAYER_ADDRESS: str(),
	CONTRIBUTION_PERIOD_INTERVAL: num(),
	INTMAX_TOKEN_ADDRESS: str({
		default: '',
	}),
	WBTC_ADDRESS: str(),
	USDC_ADDRESS: str(),
	ADMIN_PRIVATE_KEY: str({
		default: '',
	}),
	SLEEP_TIME: num({
		default: 30,
	}),
	GRANT_ROLE: bool({
		default: false,
	}),
	DEPLOY_MOCK_MESSENGER: bool({
		default: false,
	}),
})

async function main() {
	let deployedContracts = await readDeployedContracts()

	if (env.DEPLOY_MOCK_MESSENGER && !deployedContracts.mockL1ScrollMessenger) {
		console.log('deploying mockL1ScrollMessenger')
		const MockL1ScrollMessenger_ = await ethers.getContractFactory(
			'MockL1ScrollMessenger',
		)
		const l1ScrollMessenger = await MockL1ScrollMessenger_.deploy()
		const deployedContracts = await readDeployedContracts()
		await writeDeployedContracts({
			mockL1ScrollMessenger: await l1ScrollMessenger.getAddress(),
			...deployedContracts,
		})
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedContracts.testErc20 && env.INTMAX_TOKEN_ADDRESS === '') {
		console.log('deploying testErc20')
		const TestERC20 = await ethers.getContractFactory('TestERC20')
		const owner = (await ethers.getSigners())[0]
		const testErc20 = await TestERC20.deploy(owner.address)
		const deployedContracts = await readDeployedContracts()
		await writeDeployedContracts({
			testErc20: await testErc20.getAddress(),
			...deployedContracts,
		})
	}

	if (!deployedContracts.l1Contribution) {
		console.log('deploying l1Contribution')
		const contributionFactory = await ethers.getContractFactory('Contribution')
		const l1Contribution = await upgrades.deployProxy(
			contributionFactory,
			[env.ADMIN_ADDRESS, env.CONTRIBUTION_PERIOD_INTERVAL],
			{
				kind: 'uups',
			},
		)
		const deployedContracts = await readDeployedContracts()
		await writeDeployedContracts({
			l1Contribution: await l1Contribution.getAddress(),
			...deployedContracts,
		})
	}

	if (!deployedContracts.liquidity) {
		console.log('deploying liquidity')
		const deployedL2Contracts = await readDeployedContracts(
			getCounterPartNetwork(),
		)
		if (!deployedL2Contracts.rollup) {
			throw new Error('rollup address is not set')
		}
		if (!deployedL2Contracts.withdrawal) {
			throw new Error('withdrawal address is not set')
		}
		if (!deployedL2Contracts.claim) {
			throw new Error('claim address is not set')
		}

		deployedContracts = await readDeployedContracts()
		if (!deployedContracts.l1Contribution) {
			throw new Error('l1Contribution address is not set')
		}

		const liquidityFactory = await ethers.getContractFactory('Liquidity')
		let intmaxTokenAddress: string
		if (env.INTMAX_TOKEN_ADDRESS === '') {
			if (!deployedContracts.testErc20) {
				throw new Error('testErc20 address is not set')
			}
			intmaxTokenAddress = deployedContracts.testErc20
		} else {
			intmaxTokenAddress = env.INTMAX_TOKEN_ADDRESS
		}
		const initialERC20Tokens = [
			intmaxTokenAddress,
			env.WBTC_ADDRESS,
			env.USDC_ADDRESS,
		]
		const liquidity = await upgrades.deployProxy(
			liquidityFactory,
			[
				env.ADMIN_ADDRESS,
				await getL1MessengerAddress(),
				deployedL2Contracts.rollup,
				deployedL2Contracts.withdrawal,
				deployedL2Contracts.claim,
				env.RELAYER_ADDRESS,
				deployedContracts.l1Contribution,
				initialERC20Tokens,
			],
			{
				kind: 'uups',
			},
		)
		await writeDeployedContracts({
			liquidity: await liquidity.getAddress(),
			...deployedContracts,
		})
	}

	if (env.GRANT_ROLE) {
		console.log('Granting role to l2Contribution')
		if (env.ADMIN_PRIVATE_KEY === '') {
			throw new Error('ADMIN_PRIVATE_KEY is required')
		}
		let admin = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
		if (admin.address !== env.ADMIN_ADDRESS) {
			throw new Error('ADMIN_ADDRESS and ADMIN_PRIVATE_KEY do not match')
		}
		const deployedContracts = await readDeployedContracts()
		if (!deployedContracts.l1Contribution || !deployedContracts.liquidity) {
			throw new Error(
				'l1Contribution and liquidity contracts should be deployed',
			)
		}
		const l1Contribution = await ethers.getContractAt(
			'Contribution',
			deployedContracts.l1Contribution,
		)
		const role = ethers.solidityPackedKeccak256(['string'], ['CONTRIBUTOR'])
		if (!(await l1Contribution.hasRole(role, deployedContracts.liquidity))) {
			await (l1Contribution.connect(admin) as Contribution).grantRole(
				role,
				deployedContracts.liquidity,
			)
			console.log('granted role')
		}
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
