import { ethers, network, upgrades } from 'hardhat'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import { getL1MessengerAddress } from '../utils/addressBook'
import { sleep } from '../../utils/sleep'
import { getCounterPartNetwork } from '../utils/counterPartNetwork'
import { bool, cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	ADMIN_PRIVATE_KEY: str({
		default: '',
	}),
	RELAYER_ADDRESS: str(),
	PERIOD_INTERVAL: num({
		default: 60 * 60, // 1 hour
	}),
	SLEEP_TIME: num({
		default: 30,
	}),
	GRANT_ROLE: bool({
		default: false,
	}),
})

async function main() {
	let admin = env.ADMIN_ADDRESS
	if (network.name === 'localhost') {
		admin = (await ethers.getSigners())[0].address
	}

	let deployedContracts = await readDeployedContracts()
	if (!deployedContracts.mockL1ScrollMessenger) {
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

	if (!deployedContracts.testErc20) {
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
			[admin, env.PERIOD_INTERVAL],
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
		if (!deployedContracts.testErc20) {
			throw new Error('testErc20 address is not set')
		}

		const liquidityFactory = await ethers.getContractFactory('Liquidity')
		// todo fix
		const initialERC20Tokens = [
			deployedContracts.testErc20,
			'0x779877A7B0D9E8603169DdbD7836e478b4624789',
			'0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
		]
		const liquidity = await upgrades.deployProxy(
			liquidityFactory,
			[
				admin,
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
		const admin = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
		const deployedContracts = await readDeployedContracts()
		if (!deployedContracts.l1Contribution || !deployedContracts.liquidity) {
			throw new Error('l1Contribution and liquidity contracts should be deployed')
		}
		const l1Contribution = await ethers.getContractAt(
			'Contribution',
			deployedContracts.l1Contribution,
		)
		const role = ethers.solidityPackedKeccak256(['string'], ['CONTRIBUTOR'])
		if (! await l1Contribution.hasRole(role, deployedContracts.liquidity)) {
			await l1Contribution.connect(admin).grantRole(
				role,
				deployedContracts.liquidity,
			)
			console.log('granted role')
		}
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
