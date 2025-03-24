import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { PredicatePermitter, PredicateManagerTest } from '../../typechain-types'

describe('PredicatePermitter', () => {
	const POLICY = 'POLICY_ID'
	type TestObjects = {
		predicatePermitter: PredicatePermitter
		predicateManager: PredicateManagerTest
	}
	async function setup(): Promise<TestObjects> {
		const predicateManagerTestFactory = await ethers.getContractFactory(
			'PredicateManagerTest',
		)
		const predicateManager =
			(await predicateManagerTestFactory.deploy()) as unknown as PredicateManagerTest
		const predicatePermitterFactory = await ethers.getContractFactory(
			'PredicatePermitter2',
		)
		const { admin } = await getSigners()
		const predicatePermitter = (await upgrades.deployProxy(
			predicatePermitterFactory,
			[admin.address, await predicateManager.getAddress(), POLICY],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as PredicatePermitter
		return {
			predicatePermitter,
			predicateManager,
		}
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
			const predicatePermitterFactory =
				await ethers.getContractFactory('PredicatePermitter')
			const predicatePermitter = await predicatePermitterFactory.deploy()
			await expect(
				predicatePermitter.initialize(
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					'',
				),
			).to.be.revertedWithCustomError(
				predicatePermitter,
				'InvalidInitialization',
			)
		})
	})
	describe('initialize', () => {
		describe('success', () => {
			it('set owner address', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const { admin } = await getSigners()
				expect(await predicatePermitter.owner()).to.equal(admin.address)
			})
			it('set policy', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const policy = await predicatePermitter.getPolicy()
				expect(policy).to.equal(POLICY)
			})
			it('set predicate manager', async () => {
				const { predicatePermitter, predicateManager } =
					await loadFixture(setup)
				const manager = await predicatePermitter.getPredicateManager()
				expect(manager).to.equal(await predicateManager.getAddress())
			})
			it('emit PolicySet', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const filter = predicatePermitter.filters.PolicySet()
				const events = await predicatePermitter.queryFilter(filter)
				expect(events.length).to.equal(1)
				const event = events[0]
				expect(event.args[0]).to.equal(POLICY)
			})
			it('emit PredicateManagerSet', async () => {
				const { predicatePermitter, predicateManager } =
					await loadFixture(setup)
				const filter = predicatePermitter.filters.PredicateManagerSet()
				const events = await predicatePermitter.queryFilter(filter)
				expect(events.length).to.equal(1)
				const event = events[0]
				expect(event.args[0]).to.equal(await predicateManager.getAddress())
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				await expect(
					predicatePermitter.initialize(
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						'',
					),
				).to.be.revertedWithCustomError(
					predicatePermitter,
					'InvalidInitialization',
				)
			})
			it('admin address is 0', async () => {
				const predicatePermitterFactory =
					await ethers.getContractFactory('PredicatePermitter')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						predicatePermitterFactory,
						[ethers.ZeroAddress, tmpAddress, POLICY],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(
					predicatePermitterFactory,
					'AddressZero',
				)
			})
			it('predicate manager address is 0', async () => {
				const predicatePermitterFactory =
					await ethers.getContractFactory('PredicatePermitter')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						predicatePermitterFactory,
						[tmpAddress, ethers.ZeroAddress, POLICY],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(
					predicatePermitterFactory,
					'AddressZero',
				)
			})
			it('policy id is empty', async () => {
				const predicatePermitterFactory =
					await ethers.getContractFactory('PredicatePermitter')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						predicatePermitterFactory,
						[tmpAddress, tmpAddress, ''],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(
					predicatePermitterFactory,
					'PolicyIDEmpty',
				)
			})
		})
	})
	describe('setPolicy', () => {
		describe('success', () => {
			it('should allow the owner to set a new policy ID', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const { admin } = await getSigners()

				const newPolicy = 'NEW_POLICY_ID'

				await predicatePermitter.connect(admin).setPolicy(newPolicy)

				const currentPolicy = await predicatePermitter.getPolicy()
				expect(currentPolicy).to.equal(newPolicy)
			})

			it('should emit PolicySet event', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const { admin } = await getSigners()

				const newPolicy = 'NEW_POLICY_ID'

				await expect(predicatePermitter.connect(admin).setPolicy(newPolicy))
					.to.emit(predicatePermitter, 'PolicySet')
					.withArgs(newPolicy)
			})
		})

		describe('fail', () => {
			it('should revert when non-owner tries to set policy', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const { user } = await getSigners()

				const newPolicy = 'NEW_POLICY_ID'

				await expect(predicatePermitter.connect(user).setPolicy(newPolicy))
					.to.be.revertedWithCustomError(
						predicatePermitter,
						'OwnableUnauthorizedAccount',
					)
					.withArgs(user.address)
			})
		})
	})
	describe('permit', () => {
		it('should return true when validateSignatures returns true', async () => {
			const { predicatePermitter, predicateManager } = await loadFixture(setup)
			const { user } = await getSigners()

			await predicateManager.setResult(true)

			const predicateMessage = {
				taskId: 'task1',
				expireByBlockNumber: 99999999n,
				signerAddresses: [ethers.Wallet.createRandom().address],
				signatures: [ethers.hexlify(ethers.randomBytes(65))],
			}

			// encode permission
			const permission = ethers.AbiCoder.defaultAbiCoder().encode(
				[
					'tuple(string taskId, uint256 expireByBlockNumber, address[] signerAddresses, bytes[] signatures)',
				],
				[
					[
						predicateMessage.taskId,
						predicateMessage.expireByBlockNumber,
						predicateMessage.signerAddresses,
						predicateMessage.signatures,
					],
				],
			)

			// encoded function call bytes
			const encodedData = ethers.hexlify(ethers.randomBytes(32))

			await expect(
				predicatePermitter.permitOverride(
					user.address,
					0n,
					encodedData,
					permission,
				),
			)
				.to.emit(predicatePermitter, 'LatestPermitResult')
				.withArgs(true)
		})
		it('should return false when validateSignatures returns false', async () => {
			const { predicatePermitter, predicateManager } = await loadFixture(setup)
			const { user } = await getSigners()

			await predicateManager.setResult(false)

			const predicateMessage = {
				taskId: ethers.keccak256(ethers.toUtf8Bytes('task1')),
				expireByBlockNumber: 99999999n,
				signerAddresses: [ethers.Wallet.createRandom().address],
				signatures: [ethers.hexlify(ethers.randomBytes(65))],
			}

			const permission = ethers.AbiCoder.defaultAbiCoder().encode(
				[
					'tuple(string taskId, uint256 expireByBlockNumber, address[] signerAddresses, bytes[] signatures)',
				],
				[
					[
						predicateMessage.taskId,
						predicateMessage.expireByBlockNumber,
						predicateMessage.signerAddresses,
						predicateMessage.signatures,
					],
				],
			)

			const encodedData = ethers.hexlify(ethers.randomBytes(32))

			await expect(
				await predicatePermitter.permitOverride(
					user.address,
					0n,
					encodedData,
					permission,
				),
			)
				.to.emit(predicatePermitter, 'LatestPermitResult')
				.withArgs(false)
		})
	})
	describe('setPredicateManager', () => {
		describe('success', () => {
			it('should allow the owner to set a new predicate manager address', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const { admin } = await getSigners()

				const newManagerAddress = ethers.Wallet.createRandom().address

				await predicatePermitter
					.connect(admin)
					.setPredicateManager(newManagerAddress)

				const current = await predicatePermitter.getPredicateManager()
				expect(current).to.equal(newManagerAddress)
			})

			it('should emit PredicateManagerSet event', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const { admin } = await getSigners()

				const newManagerAddress = ethers.Wallet.createRandom().address

				await expect(
					predicatePermitter
						.connect(admin)
						.setPredicateManager(newManagerAddress),
				)
					.to.emit(predicatePermitter, 'PredicateManagerSet')
					.withArgs(newManagerAddress)
			})
		})
		describe('fail', () => {
			it('should revert when non-owner tries to set predicate manager', async () => {
				const { predicatePermitter } = await loadFixture(setup)
				const { user } = await getSigners()

				const newManagerAddress = ethers.Wallet.createRandom().address

				await expect(
					predicatePermitter
						.connect(user)
						.setPredicateManager(newManagerAddress),
				)
					.to.be.revertedWithCustomError(
						predicatePermitter,
						'OwnableUnauthorizedAccount',
					)
					.withArgs(user.address)
			})
		})
	})

	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const { predicatePermitter } = await loadFixture(setup)
			const signers = await getSigners()

			const owner = await predicatePermitter.owner()

			const PredicatePermitter2TestFactory = await ethers.getContractFactory(
				'PredicatePermitter2Test',
				signers.admin,
			)
			const next = await upgrades.upgradeProxy(
				await predicatePermitter.getAddress(),
				PredicatePermitter2TestFactory,
				{ unsafeAllow: ['constructor'] },
			)
			const owner2 = await next.owner()
			expect(owner).to.equal(owner2)
			const val = await next.getVal()
			expect(val).to.equal(77)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const { predicatePermitter } = await loadFixture(setup)
			const signers = await getSigners()
			const PredicatePermitter2TestFactory = await ethers.getContractFactory(
				'PredicatePermitter2Test',
				signers.user,
			)

			await expect(
				upgrades.upgradeProxy(
					await predicatePermitter.getAddress(),
					PredicatePermitter2TestFactory,
					{
						unsafeAllow: ['constructor'],
					},
				),
			)
				.to.be.revertedWithCustomError(
					predicatePermitter,
					'OwnableUnauthorizedAccount',
				)
				.withArgs(signers.user.address)
		})
	})
})
