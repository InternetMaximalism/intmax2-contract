import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { Contribution } from '../../typechain-types'

describe('Contribution', function () {
	const ONE_DAY_SECONDS = 60 * 60 * 24
	const setup = async (): Promise<[Contribution]> => {
		const contributionFactory = await ethers.getContractFactory('Contribution')
		const signers = await getSigners()

		const contribution = (await upgrades.deployProxy(
			contributionFactory,
			[signers.admin.address, ONE_DAY_SECONDS],
			{
				kind: 'uups',
				unsafeAllow: ['constructor'],
			},
		)) as unknown as Contribution

		const role = await contribution.CONTRIBUTOR()
		const { contributor } = await getSigners()
		await contribution
			.connect(signers.admin)
			.grantRole(role, contributor.address)
		return [contribution]
	}
	type signers = {
		deployer: HardhatEthersSigner
		admin: HardhatEthersSigner
		contributor: HardhatEthersSigner
		user1: HardhatEthersSigner
		user2: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, admin, contributor, user1, user2] =
			await ethers.getSigners()
		return {
			deployer,
			admin,
			contributor,
			user1,
			user2,
		}
	}
	describe('constructor', () => {
		it('should revert if not initialized through proxy', async () => {
			const contributionFactory =
				await ethers.getContractFactory('Contribution')
			const contribution =
				(await contributionFactory.deploy()) as unknown as Contribution
			await expect(
				contribution.initialize(ethers.ZeroAddress, 0),
			).to.be.revertedWithCustomError(contribution, 'InvalidInitialization')
		})
	})
	describe('initialize', () => {
		describe('success', () => {
			it('admin has admin role', async () => {
				const [contribution] = await loadFixture(setup)
				const signers = await getSigners()
				const adminRole = await contribution.DEFAULT_ADMIN_ROLE()
				expect(await contribution.hasRole(adminRole, signers.admin.address)).to
					.be.true
			})
			it('set start time stamp(one days)', async () => {
				const [contribution] = await loadFixture(setup)
				const timestamp = await time.latest()
				const startTime = await contribution.startTimestamp()
				const periodInterval = await contribution.periodInterval()
				const tmp =
					Math.floor(timestamp / Number(periodInterval)) *
					Number(periodInterval)
				expect(startTime).to.equal(tmp)
			})
			it('set start time stamp(over one days)', async () => {
				const contributionFactory =
					await ethers.getContractFactory('Contribution')
				const signers = await getSigners()

				const contribution = (await upgrades.deployProxy(
					contributionFactory,
					[signers.admin.address, ONE_DAY_SECONDS * 2],
					{
						kind: 'uups',
						unsafeAllow: ['constructor'],
					},
				)) as unknown as Contribution

				const timestamp = await time.latest()
				const startTime = await contribution.startTimestamp()
				const tmp = Math.floor(timestamp / ONE_DAY_SECONDS) * ONE_DAY_SECONDS
				expect(startTime).to.equal(tmp)
			})
		})
		describe('fail', () => {
			it('revert periodIntervalZero', async () => {
				const contributionFactory =
					await ethers.getContractFactory('Contribution')
				const signers = await getSigners()
				try {
					await upgrades.deployProxy(
						contributionFactory,
						[signers.admin.address, 0],
						{
							kind: 'uups',
							unsafeAllow: ['constructor'],
						},
					)
				} catch (error) {
					expect(error.message).to.equal(
						"VM Exception while processing transaction: reverted with custom error 'periodIntervalZero()'",
					)
					return
				}
				expect.fail()
			})
		})
	})
	describe('recordContribution', () => {
		describe('success', () => {
			it('set record', async () => {
				const [contribution] = await loadFixture(setup)
				const { contributor, user1 } = await getSigners()
				const tag = ethers.solidityPackedKeccak256(['string'], ['tag1'])
				const amount = 100n
				await contribution
					.connect(contributor)
					.recordContribution(tag, user1.address, amount)
				const currentPeriod = await contribution.getCurrentPeriod()
				const totalContribution = await contribution.totalContributions(
					currentPeriod,
					tag,
				)
				const userContribution = await contribution.userContributions(
					currentPeriod,
					tag,
					user1.address,
				)
				expect(totalContribution).to.equal(amount)
				expect(userContribution).to.equal(amount)
			})
			it('emit ContributionRecorded', async () => {
				const [contribution] = await loadFixture(setup)
				const { contributor, user1 } = await getSigners()
				const tag = ethers.solidityPackedKeccak256(['string'], ['tag1'])
				const amount = 100n
				const currentPeriod = await contribution.getCurrentPeriod()
				await expect(
					contribution
						.connect(contributor)
						.recordContribution(tag, user1.address, amount),
				)
					.to.emit(contribution, 'ContributionRecorded')
					.withArgs(currentPeriod, tag, user1.address, amount)
			})
		})
		describe('fail', () => {
			it('only contributor', async () => {
				const [contribution] = await loadFixture(setup)
				const { user1 } = await getSigners()
				const role = await contribution.CONTRIBUTOR()
				const tag = ethers.randomBytes(32)
				const amount = 100n
				await expect(
					contribution
						.connect(user1)
						.recordContribution(tag, user1.address, amount),
				)
					.to.be.revertedWithCustomError(
						contribution,
						'AccessControlUnauthorizedAccount',
					)
					.withArgs(user1.address, role)
			})
		})
	})
	describe('getCurrentPeriod', () => {
		it('get current period', async () => {
			const [contribution] = await loadFixture(setup)
			const startTimeStamp = await contribution.startTimestamp()
			const periodInterval = await contribution.periodInterval()
			await time.increase(ONE_DAY_SECONDS * 10)
			const timestamp = await time.latest()
			const currentPeriod = await contribution.getCurrentPeriod()
			const tmp = Math.floor(
				Math.floor(timestamp - Number(startTimeStamp)) / Number(periodInterval),
			)
			expect(currentPeriod).to.equal(tmp)
		})
	})

	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [contribution] = await loadFixture(setup)
			const signers = await getSigners()

			const startTimestamp = await contribution.startTimestamp()

			const contribution2Factory = await ethers.getContractFactory(
				'Contribution2Test',
				signers.admin,
			)
			const next = await upgrades.upgradeProxy(
				await contribution.getAddress(),
				contribution2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const startTimestamp2 = await next.startTimestamp()
			expect(startTimestamp).to.equal(startTimestamp2)
			const val = await next.getVal()
			expect(val).to.equal(99)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const [contribution] = await loadFixture(setup)
			const signers = await getSigners()
			const contribution2Factory = await ethers.getContractFactory(
				'Contribution2Test',
				signers.user1,
			)
			const role = contribution.DEFAULT_ADMIN_ROLE()
			await expect(
				upgrades.upgradeProxy(
					await contribution.getAddress(),
					contribution2Factory,
					{ unsafeAllow: ['constructor'] },
				),
			)
				.to.be.revertedWithCustomError(
					contribution,
					'AccessControlUnauthorizedAccount',
				)
				.withArgs(signers.user1.address, role)
		})
	})
})
