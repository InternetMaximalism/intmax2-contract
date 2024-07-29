import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { INITIAL_ERC20_TOKEN_ADDRESSES } from '../common.test'
import {
	Liquidity,
	L1ScrollMessengerTestForLiquidity,
} from '../../typechain-types'

describe('Liquidity', () => {
	async function setup(): Promise<
		[Liquidity, L1ScrollMessengerTestForLiquidity, string, string]
	> {
		const l1ScrollMessengerFactory = await ethers.getContractFactory(
			'L1ScrollMessengerTestForLiquidity',
		)
		const l1ScrollMessenger = await l1ScrollMessengerFactory.deploy()
		const rollup = ethers.Wallet.createRandom().address
		const withdrawal = ethers.Wallet.createRandom().address
		await l1ScrollMessenger.setResult(withdrawal)

		const liquidityFactory = await ethers.getContractFactory('Liquidity')
		const signers = await getSigners()
		const liquidity = (await upgrades.deployProxy(
			liquidityFactory,
			[
				await l1ScrollMessenger.getAddress(),
				rollup,
				withdrawal,
				signers.analyzer.address,
				INITIAL_ERC20_TOKEN_ADDRESSES,
			],
			{ kind: 'uups' },
		)) as unknown as Liquidity
		return [liquidity, l1ScrollMessenger, rollup, withdrawal]
	}
	type signers = {
		deployer: HardhatEthersSigner
		analyzer: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, analyzer] = await ethers.getSigners()
		return {
			deployer,
			analyzer,
		}
	}
	describe('initialize', () => {
		describe('success', () => {
			it('deployerにadmin権限が付与されている', async () => {
				const [liquidity] = await loadFixture(setup)
				const signers = await getSigners()
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const [liquidity] = await loadFixture(setup)

				await expect(
					liquidity.initialize(
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						INITIAL_ERC20_TOKEN_ADDRESSES,
					),
				).to.be.revertedWithCustomError(liquidity, 'InvalidInitialization')
			})
		})
	})
})
