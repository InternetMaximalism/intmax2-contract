import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { RateLimiterLibTest } from '../../../typechain-types'

const fixedPointOne = 10n ** 18n
const rateLimitTargetInterval = fixedPointOne * 30n // 30 seconds
const rateLimitAlpha = fixedPointOne / 3n // 1/3
const rateLimitK = fixedPointOne / 1000n // 0.001

describe('RateLimiterLibTest', function () {
	const setup = async (): Promise<RateLimiterLibTest> => {
		const RateLimiterLibTest =
			await ethers.getContractFactory('RateLimiterLibTest')
		const rateLimiterLibTest = await RateLimiterLibTest.deploy()
		await rateLimiterLibTest.setConstants(
			rateLimitTargetInterval,
			rateLimitAlpha,
			rateLimitK,
		)
		return rateLimiterLibTest
	}

	describe('setConstants', function () {
		it('should set constants and emit event', async function () {
			const RateLimiterLibTest =
				await ethers.getContractFactory('RateLimiterLibTest')
			const rateLimiterLibTest = await RateLimiterLibTest.deploy()

			await expect(
				rateLimiterLibTest.setConstants(
					rateLimitTargetInterval,
					rateLimitAlpha,
					rateLimitK,
				),
			)
				.to.emit(rateLimiterLibTest, 'RateLimitConstantsSet')
				.withArgs(rateLimitTargetInterval, rateLimitAlpha, rateLimitK)
		})

		it('should revert when alpha is greater than or equal to 1', async function () {
			const RateLimiterLibTest =
				await ethers.getContractFactory('RateLimiterLibTest')
			const rateLimiterLibTest = await RateLimiterLibTest.deploy()

			// Try with alpha = 1
			await expect(
				rateLimiterLibTest.setConstants(
					rateLimitTargetInterval,
					fixedPointOne, // alpha = 1
					rateLimitK,
				),
			).to.be.revertedWithCustomError(rateLimiterLibTest, 'InvalidConstants')

			// Try with alpha > 1
			await expect(
				rateLimiterLibTest.setConstants(
					rateLimitTargetInterval,
					fixedPointOne * 2n, // alpha = 2
					rateLimitK,
				),
			).to.be.revertedWithCustomError(rateLimiterLibTest, 'InvalidConstants')
		})
	})

	describe('update', function () {
		it('should initialize with zero penalty on first call', async function () {
			const lib = await loadFixture(setup)
			await expect(lib.update()).to.emit(lib, 'UpdateResult').withArgs(0)
		})

		it('should return zero penalty when interval is exactly the target', async function () {
			const lib = await loadFixture(setup)
			await lib.update()
			await time.increase(30) // Increase time by 30 seconds
			await expect(lib.update()).to.emit(lib, 'UpdateResult').withArgs(0)
		})

		it('should return zero penalty when interval is greater than target', async function () {
			const lib = await loadFixture(setup)
			await lib.update()
			await time.increase(40) // Increase time by 40 seconds (more than target)

			await expect(lib.update()).to.emit(lib, 'UpdateResult').withArgs(0)
		})

		it('should return non-zero penalty when interval is less than target', async function () {
			const lib = await loadFixture(setup)
			await lib.update()
			await expect(lib.update())
				.to.emit(lib, 'UpdateResult')
				.withArgs(93_444_444_444_444_437n) // about 0.93ETH
		})
	})
	describe('getPenalty', function () {
		it('should initialize with zero penalty on first call', async function () {
			const lib = await loadFixture(setup)
			await expect(await lib.getPenalty()).to.be.equal(0n)
		})

		it('should return zero penalty when interval is exactly the target', async function () {
			const lib = await loadFixture(setup)
			await lib.update()
			await time.increase(30) // Increase time by 30 seconds
			await expect(await lib.getPenalty()).to.be.equal(0n)
		})

		it('should return zero penalty when interval is greater than target', async function () {
			const lib = await loadFixture(setup)
			await lib.update()
			await time.increase(40) // Increase time by 40 seconds (more than target)

			await expect(await lib.getPenalty()).to.be.equal(0n)
		})
		it('should return non-zero penalty when interval is less than target', async function () {
			const lib = await loadFixture(setup)
			await lib.update()
			await expect(await lib.getPenalty()).to.be.equal(99_999_999_999_999_989n) // about 1ETH
		})
	})
})
