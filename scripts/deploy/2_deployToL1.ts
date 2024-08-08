import { ethers, network, upgrades } from 'hardhat'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import {
	getL1MessengerAddress,
	getUSDCAddress,
	getWBTCAddress,
} from '../utils/addressBook'
import { sleep } from '../../utils/sleep'

async function main() {
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
		const l1Contribution = await upgrades.deployProxy(contributionFactory, [], {
			kind: 'uups',
		})
		const deployedContracts = await readDeployedContracts()
		await writeDeployedContracts({
			l2Contribution: await l1Contribution.getAddress(),
			...deployedContracts,
		})
	}

	deployedContracts = await readDeployedContracts()
	if (!deployedContracts.liquidity) {
		console.log('deploying liquidity')
		if (!deployedContracts.rollup) {
			throw new Error('rollup address is not set')
		}
		if (!deployedContracts.withdrawal) {
			throw new Error('withdrawal address is not set')
		}
		const analyzer = (await ethers.getSigners())[1]
		const liquidityFactory = await ethers.getContractFactory('Liquidity')
		const initialERC20Tokens = [getUSDCAddress(), getWBTCAddress()]
		const liquidity = await upgrades.deployProxy(
			liquidityFactory,
			[
				await getL1MessengerAddress(),
				deployedContracts.rollup,
				deployedContracts.withdrawal,
				analyzer.address,
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
