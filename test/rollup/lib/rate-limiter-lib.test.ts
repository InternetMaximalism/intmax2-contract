import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { RateLimiterLibTest } from '../../../typechain-types'

describe('RateLimiterLibTest', function () {
	const setup = async (): Promise<RateLimiterLibTest> => {
		const RateLimiterLibTest =
			await ethers.getContractFactory('RateLimiterLibTest')
		return await RateLimiterLibTest.deploy()
	}
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
