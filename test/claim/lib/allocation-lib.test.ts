import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { AllocationLibTest } from '../../../typechain-types'

describe('AllocationLibTest', function () {
	const setup = async (): Promise<AllocationLibTest> => {
		const factory = await ethers.getContractFactory('AllocationLibTest')
		return await factory.deploy()
	}

	const PERIOD_INTERVAL = 60 * 60 // 1 hour
	const GENESIS_TIMESTAMP = 1722999120
	const PHASE0_REWARD_PER_DAY = ethers.parseEther('8937500') // 8937500 * 10^18
	const NUM_PHASES = 7
	const PHASE0_PERIOD = 16

	const calculateExpectedAllocationPerPeriod = (
		startTimestamp: bigint,
		period: bigint,
	): bigint => {
		const SECONDS_IN_A_DAY = 86400n

		let elapsedDays =
			(startTimestamp + period * SECONDS_IN_A_DAY - BigInt(GENESIS_TIMESTAMP)) /
			SECONDS_IN_A_DAY

		let rewardPerDay = PHASE0_REWARD_PER_DAY
		let remainingDays = elapsedDays

		for (let i = 0; i < NUM_PHASES; i++) {
			const phaseDays = BigInt(PHASE0_PERIOD) << BigInt(i) // PHASE0_PERIOD * 2^i
			if (remainingDays < phaseDays) break
			remainingDays -= phaseDays
			rewardPerDay = rewardPerDay / 2n // halve reward per phase
		}
		const expectedAllocationPerPeriod =
			(rewardPerDay * BigInt(PERIOD_INTERVAL)) / SECONDS_IN_A_DAY

		return expectedAllocationPerPeriod
	}
	describe('initialize', function () {
		it('initialize', async function () {
			const lib = await loadFixture(setup)
			const before = await lib.getStateStartTimestamp()
			expect(before).to.equal(0)
			await lib.initialize(PERIOD_INTERVAL)
			const timestamp = await time.latest()
			const after = await lib.getStateStartTimestamp()
			expect(after).to.not.equal(
				(timestamp / PERIOD_INTERVAL) * PERIOD_INTERVAL,
			)
		})
	})
	describe('recordContribution', function () {
		it('emit ContributionRecorded', async function () {
			const lib = await loadFixture(setup)
			const tmpAddress = ethers.Wallet.createRandom().address

			await lib.initialize(PERIOD_INTERVAL)
			const depositAmount = ethers.parseEther('1.0') // 1 ether -> 4 contribution (based on calculateContribution)

			const period = await lib.getCurrentPeriod()
			await expect(lib.recordContribution(tmpAddress, depositAmount))
				.to.emit(lib, 'ContributionRecorded')
				.withArgs(
					period,
					tmpAddress,
					depositAmount,
					4n, // calculateContribution(1 ether) = 4
				)
		})

		it('update state totalContributions and userContributions', async function () {
			const lib = await loadFixture(setup)
			const tmpAddress = ethers.Wallet.createRandom().address

			await lib.initialize(PERIOD_INTERVAL)
			const depositAmount = ethers.parseEther('1.0') // 1 ether -> 4 contribution
			const period = await lib.getCurrentPeriod()
			await lib.recordContribution(tmpAddress, depositAmount)

			const totalContribution = await lib.getTotalContributions(period)
			expect(totalContribution).to.equal(4n)
			const userContribution = await lib.getUserContributions(
				period,
				tmpAddress,
			)
			expect(userContribution).to.equal(4n)
		})
	})
	describe('getUserAllocation', function () {
		it('state.totalContributions[periodNumber] is 0, return 0', async function () {
			const lib = await loadFixture(setup)
			const tmpAddress = ethers.Wallet.createRandom().address

			await lib.initialize(PERIOD_INTERVAL)
			const period = await lib.getCurrentPeriod()

			// totalContributions[period] is 0 by default
			const allocation = await lib.getUserAllocation(period, tmpAddress)

			// Expect allocation to be 0 when no contributions exist
			expect(allocation).to.equal(0n)
		})

		it('return user allocation', async function () {
			const lib = await loadFixture(setup)
			const tmpAddress = ethers.Wallet.createRandom().address

			await lib.initialize(PERIOD_INTERVAL)
			const depositAmount = ethers.parseEther('1.0') // 1 ether -> 4 contribution
			const period = await lib.getCurrentPeriod()

			// Record a contribution
			await lib.recordContribution(tmpAddress, depositAmount)

			// Check allocation
			const allocation = await lib.getUserAllocation(period, tmpAddress)

			// In this case, since only one user has contributed and totalContributions == userContributions,
			// user allocation should equal allocationPerPeriod (allocationPerPeriod is calculated internally)
			const allocationPerPeriod = await lib.getAllocationPerPeriod(period)

			// Expect allocation to be allocationPerPeriod
			expect(allocation).to.equal(allocationPerPeriod)
		})
	})
	describe('consumeUserAllocation', function () {
		describe('success', function () {
			it('return user allocation', async function () {
				const lib = await loadFixture(setup)
				const tmpAddress = ethers.Wallet.createRandom().address

				await lib.initialize(PERIOD_INTERVAL)
				const depositAmount = ethers.parseEther('1.0') // 1 ether -> 4 contribution
				const period = await lib.getCurrentPeriod()

				// Record a contribution
				await lib.recordContribution(tmpAddress, depositAmount)

				// Increase time to move to the next period (finish current period)
				await time.increase(60 * 60) // PERIOD_INTERVAL = 1 hour

				// Get expected allocation before consuming
				const expectedAllocation = await lib.getUserAllocation(
					period,
					tmpAddress,
				)

				// Consume user allocation
				await lib.consumeUserAllocation(period, tmpAddress)

				// Get userAllocation stored in contract
				const allocation = await lib.userAllocation()

				// Allocation returned by consumeUserAllocation should match expected allocation
				expect(allocation).to.equal(expectedAllocation)

				// After consuming, user contribution should be reset to 0
				const userContribution = await lib.getUserContributions(
					period,
					tmpAddress,
				)
				expect(userContribution).to.equal(0n)
			})
		})

		describe('fail', function () {
			it('revert NotFinishedPeriod', async function () {
				const lib = await loadFixture(setup)
				const tmpAddress = ethers.Wallet.createRandom().address

				await lib.initialize(PERIOD_INTERVAL)
				const depositAmount = ethers.parseEther('1.0') // 1 ether -> 4 contribution
				const period = await lib.getCurrentPeriod()

				// Record a contribution
				await lib.recordContribution(tmpAddress, depositAmount)

				// Try to consume allocation without moving to next period (should revert)
				await expect(
					lib.consumeUserAllocation(period, tmpAddress),
				).to.be.revertedWithCustomError(lib, 'NotFinishedPeriod')
			})
		})
	})
	describe('getAllocationPerPeriod', function () {
		it('should return correct allocation for the first period', async function () {
			const lib = await loadFixture(setup)

			await lib.initialize(PERIOD_INTERVAL)
			const period = await lib.getCurrentPeriod()

			// Get necessary timestamps
			const startTimestamp = await lib.getStateStartTimestamp()
			const expectedAllocationPerPeriod = calculateExpectedAllocationPerPeriod(
				startTimestamp,
				period,
			)
			const allocation = await lib.getAllocationPerPeriod(period)

			// 5. Compare
			expect(allocation).to.equal(expectedAllocationPerPeriod)
		})

		it('should return 0 allocation for far future period (after all phases ended)', async function () {
			const lib = await loadFixture(setup)

			await lib.initialize(PERIOD_INTERVAL)

			// Set period number far in the future (assuming phase reduction reaches 0)
			const farFuturePeriod = 1000000

			// Call getAllocationPerPeriod for far future period
			const allocation = await lib.getAllocationPerPeriod(farFuturePeriod)

			// Expect allocation to be 0
			expect(allocation).to.equal(0n)
		})
	})
	describe('calculateContribution', function () {
		it('should return correct contribution for valid amounts', async function () {
			const lib = await loadFixture(setup)

			// 0.1 ether -> 1
			const contribution1 = await lib.calculateContribution(
				ethers.parseEther('0.1'),
			)
			expect(contribution1).to.equal(1n)

			// 1 ether -> 4
			const contribution2 = await lib.calculateContribution(
				ethers.parseEther('1'),
			)
			expect(contribution2).to.equal(4n)

			// 10 ether -> 9
			const contribution3 = await lib.calculateContribution(
				ethers.parseEther('10'),
			)
			expect(contribution3).to.equal(9n)

			// 100 ether -> 16
			const contribution4 = await lib.calculateContribution(
				ethers.parseEther('100'),
			)
			expect(contribution4).to.equal(16n)
		})

		it('should revert for invalid amounts', async function () {
			const lib = await loadFixture(setup)

			// Invalid amount: 0.5 ether
			await expect(
				lib.calculateContribution(ethers.parseEther('0.5')),
			).to.be.revertedWithCustomError(lib, 'InvalidDepositAmount')

			// Invalid amount: 2 ether
			await expect(
				lib.calculateContribution(ethers.parseEther('2')),
			).to.be.revertedWithCustomError(lib, 'InvalidDepositAmount')

			// Invalid amount: 0 ether
			await expect(
				lib.calculateContribution(ethers.parseEther('0')),
			).to.be.revertedWithCustomError(lib, 'InvalidDepositAmount')
		})
	})
	describe('getAllocationInfo', function () {
		it('should return correct values when there is no contribution', async function () {
			const lib = await loadFixture(setup)
			const tmpAddress = ethers.Wallet.createRandom().address

			await lib.initialize(PERIOD_INTERVAL)
			const period = await lib.getCurrentPeriod()

			// Call getAllocationInfo when no contribution has been recorded
			const info = await lib.getAllocationInfo(period, tmpAddress)

			// Get necessary timestamps
			const startTimestamp = await lib.getStateStartTimestamp()

			const expectedAllocationPerPeriod = calculateExpectedAllocationPerPeriod(
				startTimestamp,
				period,
			)

			expect(info.totalContribution).to.equal(0n) // no contribution
			expect(info.userContribution).to.equal(0n) // no user contribution
			expect(info.userAllocation).to.equal(0n) // no allocation since no contribution
			expect(info.allocationPerPeriod).to.equal(expectedAllocationPerPeriod) // should match calculated value
		})

		it('should return correct allocation info when contribution exists', async function () {
			const lib = await loadFixture(setup)
			const tmpAddress = ethers.Wallet.createRandom().address

			await lib.initialize(PERIOD_INTERVAL)
			const depositAmount = ethers.parseEther('1.0') // 1 ether -> 4 contribution
			const period = await lib.getCurrentPeriod()

			// Record a contribution
			await lib.recordContribution(tmpAddress, depositAmount)

			// Call getAllocationInfo
			const info = await lib.getAllocationInfo(period, tmpAddress)

			// Expected total contribution and user contribution
			const expectedContribution = 4n // based on calculateContribution(1 ether)
			expect(info.totalContribution).to.equal(expectedContribution)
			expect(info.userContribution).to.equal(expectedContribution)

			// Expected allocation per period
			const allocationPerPeriod = await lib.getAllocationPerPeriod(period)
			expect(info.allocationPerPeriod).to.equal(allocationPerPeriod)

			// Since only one user contributed, userAllocation should equal allocationPerPeriod
			expect(info.userAllocation).to.equal(allocationPerPeriod)
		})
	})
	describe('getAllocationConstants', function () {
		it('should return correct constants', async function () {
			const lib = await loadFixture(setup)

			// Set start timestamp first
			await lib.initialize(PERIOD_INTERVAL)

			// Call getAllocationConstants
			const constants = await lib.getAllocationConstants()

			// Get current state.startTimestamp via getter to compare
			const startTimestamp = await lib.getStateStartTimestamp()

			// Check each constant value
			expect(constants.startTimestamp).to.equal(startTimestamp)
			expect(constants.periodInterval).to.equal(PERIOD_INTERVAL)
			expect(constants.genesisTimestamp).to.equal(GENESIS_TIMESTAMP)
			expect(constants.phase0RewardPerDay).to.equal(PHASE0_REWARD_PER_DAY)
			expect(constants.numPhases).to.equal(NUM_PHASES)
			expect(constants.phase0Period).to.equal(PHASE0_PERIOD)
		})
	})
})
