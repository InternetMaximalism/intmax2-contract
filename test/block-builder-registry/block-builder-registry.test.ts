import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import { BlockBuilderRegistry } from '../../typechain-types'

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

	type signers = {
		deployer: HardhatEthersSigner
		admin: HardhatEthersSigner
		user: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, admin, user] = await ethers.getSigners()
		return {
			deployer,
			admin,
			user,
		}
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
	describe('emitHeartbeat', () => {
		it('emit BlockBuilderHeartbeat event', async () => {
			const blockBuilderRegistry = await loadFixture(setup)
			const signers = await getSigners()
			await expect(blockBuilderRegistry.emitHeartbeat(DUMMY_URL))
				.to.emit(blockBuilderRegistry, 'BlockBuilderHeartbeat')
				.withArgs(signers.deployer.address, DUMMY_URL)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const blockBuilderRegistry = await loadFixture(setup)
			const signers = await getSigners()

			await blockBuilderRegistry.emitHeartbeat(DUMMY_URL)

			const registry2Factory = await ethers.getContractFactory(
				'BlockBuilderRegistry2Test',
				signers.admin,
			)
			const next = await upgrades.upgradeProxy(
				await blockBuilderRegistry.getAddress(),
				registry2Factory,
				{ unsafeAllow: ['constructor'] },
			)

			const filter = next.filters.BlockBuilderHeartbeat()
			const logs = await next.queryFilter(filter)
			expect(logs.length).to.equal(1)
			expect(logs[0].args?.url).to.equal(DUMMY_URL)

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
})
