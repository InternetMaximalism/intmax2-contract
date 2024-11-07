import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import {
	BlockBuilderRegistry,
	IBlockBuilderRegistry,
} from '../../typechain-types'
import { getGasCost } from '../common.test'

describe('BlockBuilderRegistry', () => {
	const DUMMY_URL = 'https://dummy.com'
	const setup = async (): Promise<[BlockBuilderRegistry]> => {
		const blockBuilderRegistryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistry',
		)
		const blockBuilderRegistry = (await upgrades.deployProxy(
			blockBuilderRegistryFactory,
			[],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as BlockBuilderRegistry
		return [blockBuilderRegistry]
	}

	const getDefaultBlockBuilderInfo =
		(): IBlockBuilderRegistry.BlockBuilderInfoStruct => {
			return {
				blockBuilderUrl: '',
				stakeAmount: 0n,
				stopTime: 0n,
				numSlashes: 0n,
				isValid: false,
			}
		}

	type signers = {
		deployer: HardhatEthersSigner
		blockBuilder1: HardhatEthersSigner
		blockBuilder2: HardhatEthersSigner
		blockBuilder3: HardhatEthersSigner
		notStakedBlockBuilder: HardhatEthersSigner
		challenger: HardhatEthersSigner
		user: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [
			deployer,
			blockBuilder1,
			blockBuilder2,
			blockBuilder3,
			notStakedBlockBuilder,
			challenger,
			user,
		] = await ethers.getSigners()
		return {
			deployer,
			blockBuilder1,
			blockBuilder2,
			blockBuilder3,
			notStakedBlockBuilder,
			challenger,
			user,
		}
	}
	const checkBlockBuilderInfo = (
		blockBuilderInfo: [string, bigint, bigint, bigint, boolean] & {
			blockBuilderUrl: string
			stakeAmount: bigint
			stopTime: bigint
			numSlashes: bigint
			isValid: boolean
		},
		blockBuilderInfo2: IBlockBuilderRegistry.BlockBuilderInfoStruct,
	) => {
		expect(blockBuilderInfo.blockBuilderUrl).to.equal(
			blockBuilderInfo2.blockBuilderUrl,
		)
		expect(blockBuilderInfo.stakeAmount).to.equal(blockBuilderInfo2.stakeAmount)
		expect(blockBuilderInfo.stopTime).to.equal(blockBuilderInfo2.stopTime)
		expect(blockBuilderInfo.numSlashes).to.equal(blockBuilderInfo2.numSlashes)
		expect(blockBuilderInfo.isValid).to.equal(blockBuilderInfo2.isValid)
	}
	describe('constructor', () => {
		it('should revert if not initialized through proxy', async () => {
			const blockBuilderRegistryFactory = await ethers.getContractFactory(
				'BlockBuilderRegistry',
			)
			const blockBuilderRegistry =
				(await blockBuilderRegistryFactory.deploy()) as unknown as BlockBuilderRegistry
			await expect(
				blockBuilderRegistry.initialize(),
			).to.be.revertedWithCustomError(
				blockBuilderRegistry,
				'InvalidInitialization',
			)
		})
	})
	describe('initialize', () => {
		describe('success', () => {
			it('should revert when initializing for the second time', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				await expect(
					blockBuilderRegistry.initialize(),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'InvalidInitialization',
				)
			})
			it('should set the deployer as the owner', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				expect(await blockBuilderRegistry.owner()).to.equal(
					signers.deployer.address,
				)
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					blockBuilderRegistry.initialize(),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'InvalidInitialization',
				)
			})
		})
	})
	describe('updateBlockBuilder', () => {
		describe('success', () => {
			it('should update blockBuilders', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(
					blockBuilderInfoBefore,
					getDefaultBlockBuilderInfo(),
				)

				const stakeAmount = ethers.parseEther('0.3')
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})
			})
			it('should stake the base currency', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const balanceBefore = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				const stakeAmount = ethers.parseEther('0.3')
				const res = await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
				const gasCost = await getGasCost(res)
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				expect(balanceBefore - stakeAmount - gasCost).to.equal(balanceAfter)
			})
			it('should update stakeAmount when the same sender executes updateBlockBuilder', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const balanceBefore = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				const stakeAmount1 = ethers.parseEther('0.3')
				const res1 = await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount1 })
				const gasCost1 = await getGasCost(res1)
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoBefore, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount1,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})

				const stakeAmount2 = ethers.parseEther('0.5')
				const res2 = await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount2 })
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				const gasCost2 = await getGasCost(res2)
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount1 + stakeAmount2,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})
				expect(
					balanceBefore - stakeAmount1 - stakeAmount2 - gasCost1 - gasCost2,
				).to.equal(balanceAfter)
			})
			it('should emit BlockBuilderUpdated event when updateBlockBuilder is executed', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const stakeAmount = ethers.parseEther('0.3')
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.updateBlockBuilder(DUMMY_URL, { value: stakeAmount }),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderUpdated')
					.withArgs(signers.blockBuilder1.address, DUMMY_URL, stakeAmount)
			})
		})
		describe('fail', () => {
			it('should revert with InsufficientStakeAmount when total stake amount is less than MIN_STAKE_AMOUNT', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.updateBlockBuilder(DUMMY_URL),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'InsufficientStakeAmount',
				)
			})
			it('should revert with URLIsEmpty when url is 0 length', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.updateBlockBuilder(''),
				).to.be.revertedWithCustomError(blockBuilderRegistry, 'URLIsEmpty')
			})
		})
	})
	describe('stopBlockBuilder', () => {
		describe('success', () => {
			it('should update block builder information', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const stakeAmount = ethers.parseEther('0.3')
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoBefore, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.stopBlockBuilder()
				const currentTimestamp = await time.latest()
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: currentTimestamp,
					numSlashes: 0n,
					isValid: false,
				})
			})
			it('should emit BlockBuilderStopped event', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const stakeAmount = ethers.parseEther('0.3')
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.stopBlockBuilder(),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderStopped')
					.withArgs(signers.blockBuilder1.address)
			})
		})
		describe('fail', () => {
			it('should revert with BlockBuilderNotFound error when not staked', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.notStakedBlockBuilder.address,
				)
				const defaultBlockBuilderInfo = getDefaultBlockBuilderInfo()
				checkBlockBuilderInfo(blockBuilderInfo, defaultBlockBuilderInfo)
				await expect(
					blockBuilderRegistry
						.connect(signers.notStakedBlockBuilder)
						.stopBlockBuilder(),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'BlockBuilderNotFound',
				)
			})
		})
	})
	describe('isValidBlockBuilder', () => {
		it('should return false when not valid', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			const result = await blockBuilderRegistry.isValidBlockBuilder(
				signers.notStakedBlockBuilder.address,
			)
			expect(result).to.be.false
		})
		it('should return true when valid', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			const stakeAmount = ethers.parseEther('0.3')
			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
			const result = await blockBuilderRegistry.isValidBlockBuilder(
				signers.blockBuilder1.address,
			)
			expect(result).to.be.true
		})
	})

	describe('getValidBlockBuilders', () => {
		it('get block builder info', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const { blockBuilder1, blockBuilder2, blockBuilder3 } = await getSigners()

			await blockBuilderRegistry
				.connect(blockBuilder1)
				.updateBlockBuilder(DUMMY_URL + '1', {
					value: ethers.parseEther('0.3'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder2)
				.updateBlockBuilder(DUMMY_URL + '2', {
					value: ethers.parseEther('0.2'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder3)
				.updateBlockBuilder(DUMMY_URL + '3', {
					value: ethers.parseEther('0.1'),
				})
			const builders = await blockBuilderRegistry.getValidBlockBuilders()
			expect(builders.length).to.equal(3)
			expect(builders[0].blockBuilderAddress).to.equal(blockBuilder1)
			expect(builders[0].info.blockBuilderUrl).to.equal(DUMMY_URL + '1')
			expect(builders[0].info.stakeAmount).to.equal(ethers.parseEther('0.3'))
			expect(builders[0].info.stopTime).to.equal(0)
			expect(builders[0].info.numSlashes).to.equal(0)
			expect(builders[0].info.isValid).to.equal(true)

			expect(builders[1].blockBuilderAddress).to.equal(blockBuilder2)
			expect(builders[1].info.blockBuilderUrl).to.equal(DUMMY_URL + '2')
			expect(builders[1].info.stakeAmount).to.equal(ethers.parseEther('0.2'))
			expect(builders[1].info.stopTime).to.equal(0)
			expect(builders[1].info.numSlashes).to.equal(0)
			expect(builders[1].info.isValid).to.equal(true)

			expect(builders[2].blockBuilderAddress).to.equal(blockBuilder3)
			expect(builders[2].info.blockBuilderUrl).to.equal(DUMMY_URL + '3')
			expect(builders[2].info.stakeAmount).to.equal(ethers.parseEther('0.1'))
			expect(builders[2].info.stopTime).to.equal(0)
			expect(builders[2].info.numSlashes).to.equal(0)
			expect(builders[2].info.isValid).to.equal(true)
		})

		it('only valid block info', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const { blockBuilder1, blockBuilder2, blockBuilder3 } = await getSigners()

			await blockBuilderRegistry
				.connect(blockBuilder1)
				.updateBlockBuilder(DUMMY_URL + '1', {
					value: ethers.parseEther('0.3'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder2)
				.updateBlockBuilder(DUMMY_URL + '2', {
					value: ethers.parseEther('0.2'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder3)
				.updateBlockBuilder(DUMMY_URL + '3', {
					value: ethers.parseEther('0.1'),
				})

			await blockBuilderRegistry.connect(blockBuilder2).stopBlockBuilder()

			const builders = await blockBuilderRegistry.getValidBlockBuilders()
			expect(builders.length).to.equal(2)
			expect(builders[0].blockBuilderAddress).to.equal(blockBuilder1)
			expect(builders[0].info.blockBuilderUrl).to.equal(DUMMY_URL + '1')
			expect(builders[0].info.stakeAmount).to.equal(ethers.parseEther('0.3'))
			expect(builders[0].info.stopTime).to.equal(0)
			expect(builders[0].info.numSlashes).to.equal(0)
			expect(builders[0].info.isValid).to.equal(true)

			expect(builders[1].blockBuilderAddress).to.equal(blockBuilder3)
			expect(builders[1].info.blockBuilderUrl).to.equal(DUMMY_URL + '3')
			expect(builders[1].info.stakeAmount).to.equal(ethers.parseEther('0.1'))
			expect(builders[1].info.stopTime).to.equal(0)
			expect(builders[1].info.numSlashes).to.equal(0)
			expect(builders[1].info.isValid).to.equal(true)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()

			const stakeAmount = ethers.parseEther('0.3')
			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

			const registry2Factory = await ethers.getContractFactory(
				'BlockBuilderRegistry2Test',
			)
			const next = await upgrades.upgradeProxy(
				await blockBuilderRegistry.getAddress(),
				registry2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const blockBuilderInfo = await blockBuilderRegistry.blockBuilders(
				signers.blockBuilder1.address,
			)
			expect(blockBuilderInfo.blockBuilderUrl).to.equal(DUMMY_URL)
			const val = await next.getVal()
			expect(val).to.equal(1)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			const registryFactory = await ethers.getContractFactory(
				'BlockBuilderRegistry2Test',
				signers.user,
			)
			await expect(
				upgrades.upgradeProxy(
					await blockBuilderRegistry.getAddress(),
					registryFactory,
					{ unsafeAllow: ['constructor'] },
				),
			)
				.to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'OwnableUnauthorizedAccount',
				)
				.withArgs(signers.user.address)
		})
	})
	describe('reentrancy', () => {
		it.skip('unstake', async () => {
			// payable(recipient).transfer(amount);
			// The gas consumption is limited to 2500 because the transfer function is performed.
			// Therefore, reentrancy attacks that execute complex logic are not possible.
		})
		it.skip('slashBlockBuilder', async () => {
			// payable(recipient).transfer(amount);
			// The gas consumption is limited to 2500 because the transfer function is performed.
			// Therefore, reentrancy attacks that execute complex logic are not possible.
		})
	})
})
