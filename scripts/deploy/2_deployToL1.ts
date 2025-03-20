import { ethers, network, upgrades } from 'hardhat'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import { cleanEnv, num, str } from 'envalid'
import { sleep } from '../../utils/sleep'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	ANALYZER_ADDRESS: str(),
	SLEEP_TIME: num({
		default: 30,
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
		await sleep(30)
	}

	if (!deployedContracts.l1Contribution) {
		console.log('deploying l1Contribution')
		const contributionFactory = await ethers.getContractFactory('Contribution')
		const l1Contribution = await upgrades.deployProxy(
			contributionFactory,
			[admin],
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
		const deployedL2Contracts = await readDeployedContracts()
		if (!deployedL2Contracts.rollup) {
			throw new Error('rollup address is not set')
		}
		if (!deployedL2Contracts.withdrawal) {
			throw new Error('withdrawal address is not set')
		}
		if (!deployedL2Contracts.claim) {
			throw new Error('claim address is not set')
		}
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
				env.ADMIN_ADDRESS,
				deployedL2Contracts.rollup,
				deployedL2Contracts.withdrawal,
				deployedL2Contracts.claim,
				env.ANALYZER_ADDRESS,
				deployedContracts.l1Contribution,
				initialERC20Tokens,
			],
			{
				kind: 'uups',
			},
		)

		// grant roles
		if (!deployedContracts.l1Contribution) {
			throw new Error('l1Contribution address is not set')
		}
		const l1Contribution = await ethers.getContractAt(
			'Contribution',
			deployedContracts.l1Contribution,
		)
		await l1Contribution.grantRole(
			ethers.solidityPackedKeccak256(['string'], ['CONTRIBUTOR']),
			liquidity,
		)
		console.log('granted role')

		deployedContracts = await readDeployedContracts()
		await writeDeployedContracts({
			liquidity: await liquidity.getAddress(),
			...deployedContracts,
		})
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
