import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import {
	BlockBuilderRegistry,
	IBlockBuilderRegistry,
} from '../../typechain-types'

describe('BlockBuilderRegistry', () => {
	const DUMMY_URL = 'https://dummy.com'
	const setup = async (): Promise<BlockBuilderRegistry> => {
		const blockBuilderRegistryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistry',
		)
		const signers = await getSigners()

		const blockBuilderRegistry = (await upgrades.deployProxy(
			blockBuilderRegistryFactory,
			[signers.admin.address],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as BlockBuilderRegistry
		return blockBuilderRegistry
	}

	const getDefaultBlockBuilderInfo =
		(): IBlockBuilderRegistry.BlockBuilderInfoStruct => {
			return {
				blockBuilderUrl: '',
				isActive: false,
			}
		}

	type signers = {
		deployer: HardhatEthersSigner
		admin: HardhatEthersSigner
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
			admin,
			blockBuilder1,
			blockBuilder2,
			blockBuilder3,
			notStakedBlockBuilder,
			challenger,
			user,
		] = await ethers.getSigners()
		return {
			deployer,
			admin,
			blockBuilder1,
			blockBuilder2,
			blockBuilder3,
			notStakedBlockBuilder,
			challenger,
			user,
		}
	}
	const checkBlockBuilderInfo = (
		blockBuilderInfo: [string, boolean] & {
			blockBuilderUrl: string
			isActive: boolean
		},
		blockBuilderInfo2: IBlockBuilderRegistry.BlockBuilderInfoStruct,
	) => {
		expect(blockBuilderInfo.blockBuilderUrl).to.equal(
			blockBuilderInfo2.blockBuilderUrl,
		)
		expect(blockBuilderInfo.isActive).to.equal(blockBuilderInfo2.isActive)
	}
	describe('constructor', () => {
		it('should revert if not initialized through proxy', async () => {
			const blockBuilderRegistryFactory = await ethers.getContractFactory(
				'BlockBuilderRegistry',
			)
			const blockBuilderRegistry =
				(await blockBuilderRegistryFactory.deploy()) as unknown as BlockBuilderRegistry
			await expect(
				blockBuilderRegistry.initialize(ethers.ZeroAddress),
			).to.be.revertedWithCustomError(
				blockBuilderRegistry,
				'InvalidInitialization',
			)
		})
	})
	describe('initialize', () => {
		describe('success', () => {
			it('should set the deployer as the owner', async () => {
				const blockBuilderRegistry = await loadFixture(setup)
				const signers = await getSigners()
				expect(await blockBuilderRegistry.owner()).to.equal(
					signers.admin.address,
				)
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const blockBuilderRegistry = await loadFixture(setup)
				await expect(
					blockBuilderRegistry.initialize(ethers.ZeroAddress),
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
				const blockBuilderRegistry = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(
					blockBuilderInfoBefore,
					getDefaultBlockBuilderInfo(),
				)

				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL)
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					isActive: true,
				})
			})
			it('should emit BlockBuilderUpdated event when updateBlockBuilder is executed', async () => {
				const blockBuilderRegistry = await loadFixture(setup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.updateBlockBuilder(DUMMY_URL),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderUpdated')
					.withArgs(signers.blockBuilder1.address, DUMMY_URL)
			})
		})
		describe('fail', () => {
			it('should revert with URLIsEmpty when url is 0 length', async () => {
				const blockBuilderRegistry = await loadFixture(setup)
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
				const blockBuilderRegistry = await loadFixture(setup)
				const signers = await getSigners()
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL)

				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.stopBlockBuilder()
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					isActive: false,
				})
			})
			it('should emit BlockBuilderStopped event', async () => {
				const blockBuilderRegistry = await loadFixture(setup)
				const signers = await getSigners()
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL)

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
				const blockBuilderRegistry = await loadFixture(setup)
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
	describe('isActiveBlockBuilder', () => {
		it('should return false when not valid', async () => {
			const blockBuilderRegistry = await loadFixture(setup)
			const signers = await getSigners()
			const result = await blockBuilderRegistry.isActiveBlockBuilder(
				signers.notStakedBlockBuilder.address,
			)
			expect(result).to.be.false
		})
		it('should return true when valid', async () => {
			const blockBuilderRegistry = await loadFixture(setup)
			const signers = await getSigners()
			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.updateBlockBuilder(DUMMY_URL)
			const result = await blockBuilderRegistry.isActiveBlockBuilder(
				signers.blockBuilder1.address,
			)
			expect(result).to.be.true
		})
	})

	describe('getActiveBlockBuilders', () => {
		it('get block builder info', async () => {
			const blockBuilderRegistry = await loadFixture(setup)
			const { blockBuilder1, blockBuilder2, blockBuilder3 } = await getSigners()

			await blockBuilderRegistry
				.connect(blockBuilder1)
				.updateBlockBuilder(DUMMY_URL + '1')
			await blockBuilderRegistry
				.connect(blockBuilder2)
				.updateBlockBuilder(DUMMY_URL + '2')
			await blockBuilderRegistry
				.connect(blockBuilder3)
				.updateBlockBuilder(DUMMY_URL + '3')
			const builders = await blockBuilderRegistry.getActiveBlockBuilders()
			expect(builders.length).to.equal(3)
			expect(builders[0].blockBuilderAddress).to.equal(blockBuilder1)
			expect(builders[0].info.blockBuilderUrl).to.equal(DUMMY_URL + '1')
			expect(builders[0].info.isActive).to.equal(true)

			expect(builders[1].blockBuilderAddress).to.equal(blockBuilder2)
			expect(builders[1].info.blockBuilderUrl).to.equal(DUMMY_URL + '2')
			expect(builders[1].info.isActive).to.equal(true)

			expect(builders[2].blockBuilderAddress).to.equal(blockBuilder3)
			expect(builders[2].info.blockBuilderUrl).to.equal(DUMMY_URL + '3')
			expect(builders[2].info.isActive).to.equal(true)
		})

		it('only valid block info', async () => {
			const blockBuilderRegistry = await loadFixture(setup)
			const { blockBuilder1, blockBuilder2, blockBuilder3 } = await getSigners()

			await blockBuilderRegistry
				.connect(blockBuilder1)
				.updateBlockBuilder(DUMMY_URL + '1')
			await blockBuilderRegistry
				.connect(blockBuilder2)
				.updateBlockBuilder(DUMMY_URL + '2')
			await blockBuilderRegistry
				.connect(blockBuilder3)
				.updateBlockBuilder(DUMMY_URL + '3')

			await blockBuilderRegistry.connect(blockBuilder2).stopBlockBuilder()

			const builders = await blockBuilderRegistry.getActiveBlockBuilders()
			expect(builders.length).to.equal(2)
			expect(builders[0].blockBuilderAddress).to.equal(blockBuilder1)
			expect(builders[0].info.blockBuilderUrl).to.equal(DUMMY_URL + '1')
			expect(builders[0].info.isActive).to.equal(true)

			expect(builders[1].blockBuilderAddress).to.equal(blockBuilder3)
			expect(builders[1].info.blockBuilderUrl).to.equal(DUMMY_URL + '3')
			expect(builders[1].info.isActive).to.equal(true)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const blockBuilderRegistry = await loadFixture(setup)
			const signers = await getSigners()

			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.updateBlockBuilder(DUMMY_URL)

			const registry2Factory = await ethers.getContractFactory(
				'BlockBuilderRegistry2Test',
				signers.admin,
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
			const blockBuilderRegistry = await loadFixture(setup)
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
