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

	it('should initialize with zero penalty on first call', async function () {
		const lib = await loadFixture(setup)
		await expect(lib.update()).to.emit(lib, 'UpdateResult').withArgs(0)
	})

	it('should return zero penalty when interval is exactly the target', async function () {
		const lib = await loadFixture(setup)
		await lib.update()
		await time.increase(15) // Increase time by 15 seconds
		await expect(lib.update()).to.emit(lib, 'UpdateResult').withArgs(0)
	})

	it('should return zero penalty when interval is greater than target', async function () {
		const lib = await loadFixture(setup)
		await lib.update()
		await time.increase(20) // Increase time by 20 seconds (more than target)

		await expect(lib.update()).to.emit(lib, 'UpdateResult').withArgs(0)
	})

	it('should return non-zero penalty when interval is less than target', async function () {
		const lib = await loadFixture(setup)
		await lib.update()
		await expect(lib.update())
			.to.emit(lib, 'UpdateResult')
			.withArgs(21777777777777774n) // about 0.22ETH
	})
})
