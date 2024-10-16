import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { Contribution } from '../../typechain-types'

describe('Contribution', function () {
	const setup = async (): Promise<[Contribution]> => {
		const contributionFactory = await ethers.getContractFactory('Contribution')
		const contribution = (await upgrades.deployProxy(contributionFactory, [], {
			kind: 'uups',
			unsafeAllow: ['constructor'],
		})) as unknown as Contribution

		// register the weight of the contribution
		const tagsStr = ['tag1', 'tag2', 'tag3']
		const tags = tagsStr.map((tag) =>
			ethers.solidityPackedKeccak256(['string'], [tag]),
		)
		const weights = [1, 2, 3]
		await contribution.registerWeights(0, tags, weights)
		const role = await contribution.CONTRIBUTOR()
		const { contributor } = await getSigners()
		await contribution.grantRole(role, contributor.address)
		return [contribution]
	}
	type signers = {
		deployer: HardhatEthersSigner
		contributor: HardhatEthersSigner
		user1: HardhatEthersSigner
		user2: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, contributor, user1, user2] = await ethers.getSigners()
		return {
			deployer,
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
			await expect(contribution.initialize()).to.be.revertedWithCustomError(
				contribution,
				'InvalidInitialization',
			)
		})
	})
	describe('initialize', () => {
		it('deployer has admin role', async () => {
			const [contribution] = await loadFixture(setup)
			const signers = await getSigners()
			const adminRole = await contribution.DEFAULT_ADMIN_ROLE()
			expect(await contribution.hasRole(adminRole, signers.deployer.address)).to
				.be.true
		})
		it('deployer has WEIGHT_REGISTRAR role', async () => {
			const [contribution] = await loadFixture(setup)
			const signers = await getSigners()
			const role = await contribution.WEIGHT_REGISTRAR()
			expect(await contribution.hasRole(role, signers.deployer.address)).to.be
				.true
		})
		it('deployer has CONTRIBUTOR role', async () => {
			const [contribution] = await loadFixture(setup)
			const signers = await getSigners()
			const role = await contribution.CONTRIBUTOR()
			expect(await contribution.hasRole(role, signers.contributor.address)).to
				.be.true
		})
	})
	describe('incrementPeriod', () => {
		describe('success', () => {
			it('only weight registrar', async () => {
				const [contribution] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const period = await contribution.currentPeriod()
				await contribution.connect(deployer).incrementPeriod()
				expect(await contribution.currentPeriod()).to.be.equal(period + 1n)
			})
			it('emit PeriodIncremented', async () => {
				const [contribution] = await loadFixture(setup)
				const { deployer } = await getSigners()
				await expect(contribution.connect(deployer).incrementPeriod())
					.to.emit(contribution, 'PeriodIncremented')
					.withArgs(1)
			})
		})
		describe('fail', () => {
			it('only weight registrar', async () => {
				const [contribution] = await loadFixture(setup)
				const { user1 } = await getSigners()
				const role = await contribution.WEIGHT_REGISTRAR()
				await expect(contribution.connect(user1).incrementPeriod())
					.to.be.revertedWithCustomError(
						contribution,
						'AccessControlUnauthorizedAccount',
					)
					.withArgs(user1.address, role)
			})
		})
	})
	describe('registerWeights', () => {
		describe('success', () => {
			it('set register weights', async () => {
				const [contribution] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const tagsStr = ['newTag1', 'newTag2']
				const tags = tagsStr.map((tag) =>
					ethers.solidityPackedKeccak256(['string'], [tag]),
				)
				const weights = [4, 5]
				await contribution.connect(deployer).registerWeights(1, tags, weights)
				const registeredTags = await contribution.getTags(1)
				const registeredWeights = await contribution.getWeights(1)
				expect(registeredTags).to.deep.equal(tags)
				expect(registeredWeights).to.deep.equal(weights)
			})
			it('emit WeightRegistered', async () => {
				const [contribution] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const tags = [ethers.randomBytes(32)]
				const weights = [1]
				await expect(
					contribution.connect(deployer).registerWeights(1, tags, weights),
				)
					.to.emit(contribution, 'WeightRegistered')
					.withArgs(1, tags, weights)
			})
		})
		describe('fail', () => {
			it('only weight registrar', async () => {
				const [contribution] = await loadFixture(setup)
				const { user1 } = await getSigners()
				const role = await contribution.WEIGHT_REGISTRAR()
				const tags = [ethers.randomBytes(32)]
				const weights = [1]
				await expect(
					contribution.connect(user1).registerWeights(1, tags, weights),
				)
					.to.be.revertedWithCustomError(
						contribution,
						'AccessControlUnauthorizedAccount',
					)
					.withArgs(user1.address, role)
			})
			it('InvalidInputLength', async () => {
				const [contribution] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const tags = [ethers.randomBytes(32), ethers.randomBytes(32)]
				const weights = [1]
				await expect(
					contribution.connect(deployer).registerWeights(1, tags, weights),
				).to.be.revertedWithCustomError(contribution, 'InvalidInputLength')
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
				const currentPeriod = await contribution.currentPeriod()
				const totalContribution = await contribution.totalContributionsInPeriod(
					currentPeriod,
					tag,
				)
				const userContribution = await contribution.contributionsInPeriod(
					currentPeriod,
					tag,
					user1.address,
				)
				expect(totalContribution).to.equal(amount)
				expect(userContribution).to.equal(amount)
			})
			it('set record(increment currentPeriod)', async () => {
				const [contribution] = await loadFixture(setup)
				const { deployer, contributor, user1 } = await getSigners()
				const tag = ethers.solidityPackedKeccak256(['string'], ['tag1'])
				const amount = 100n
				await contribution.connect(deployer).incrementPeriod()
				const currentPeriod = await contribution.currentPeriod()
				await contribution
					.connect(contributor)
					.recordContribution(tag, user1.address, amount)
				const totalContribution = await contribution.totalContributionsInPeriod(
					currentPeriod,
					tag,
				)
				const userContribution = await contribution.contributionsInPeriod(
					currentPeriod,
					tag,
					user1.address,
				)
				expect(totalContribution).to.equal(amount)
				expect(userContribution).to.equal(amount)
			})
			it('set record(add amount)', async () => {
				const [contribution] = await loadFixture(setup)
				const { contributor, user1 } = await getSigners()
				const tag = ethers.solidityPackedKeccak256(['string'], ['tag1'])
				const amount = 100n
				await contribution
					.connect(contributor)
					.recordContribution(tag, user1.address, amount)
				await contribution
					.connect(contributor)
					.recordContribution(tag, user1.address, amount)
				const currentPeriod = await contribution.currentPeriod()
				const totalContribution = await contribution.totalContributionsInPeriod(
					currentPeriod,
					tag,
				)
				const userContribution = await contribution.contributionsInPeriod(
					currentPeriod,
					tag,
					user1.address,
				)
				expect(totalContribution).to.equal(amount * 2n)
				expect(userContribution).to.equal(amount * 2n)
			})
			it('emit ContributionRecorded', async () => {
				const [contribution] = await loadFixture(setup)
				const { contributor, user1 } = await getSigners()
				const tag = ethers.solidityPackedKeccak256(['string'], ['tag1'])
				const amount = 100n
				const currentPeriod = await contribution.currentPeriod()
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
	describe('getContributionRate', () => {
		it('get contribution rate', async () => {
			const [contribution] = await loadFixture(setup)
			const { deployer, contributor, user1 } = await getSigners()
			const tag1 = ethers.solidityPackedKeccak256(['string'], ['tag1'])
			const tag2 = ethers.solidityPackedKeccak256(['string'], ['tag2'])
			await contribution
				.connect(contributor)
				.recordContribution(tag1, user1.address, 100n)
			await contribution
				.connect(contributor)
				.recordContribution(tag2, user1.address, 200n)
			await contribution
				.connect(contributor)
				.recordContribution(tag1, deployer.address, 300n)
			const rate = await contribution.getContributionRate(0, user1.address)
			// Expected rate: (100 * 1 + 200 * 2) / (400 * 1 + 200 * 2) = 500 / 800 = 0.625
			expect(rate).to.be.closeTo(
				ethers.parseUnits('0.625', 18),
				ethers.parseUnits('0.0001', 18),
			)
		})
	})
	describe('getCurrentContribution', () => {
		it('get current contribution', async () => {
			const [contribution] = await loadFixture(setup)
			const { deployer, contributor, user1 } = await getSigners()
			const tag1 = ethers.solidityPackedKeccak256(['string'], ['tag1'])
			const tag2 = ethers.solidityPackedKeccak256(['string'], ['tag2'])
			await contribution
				.connect(contributor)
				.recordContribution(tag1, user1.address, 100n)
			await contribution
				.connect(contributor)
				.recordContribution(tag1, user1.address, 200n)
			await contribution
				.connect(contributor)
				.recordContribution(tag2, deployer.address, 300n)
			const currentContribution = await contribution.getCurrentContribution(
				tag1,
				user1.address,
			)
			expect(currentContribution).to.equal(300n)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [contribution] = await loadFixture(setup)

			await contribution.incrementPeriod()

			const contribution2Factory =
				await ethers.getContractFactory('Contribution2Test')
			const next = await upgrades.upgradeProxy(
				await contribution.getAddress(),
				contribution2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const currentPeriod = await next.currentPeriod()
			expect(currentPeriod).to.equal(1)
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
