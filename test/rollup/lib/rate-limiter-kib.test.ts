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

	// it('should return non-zero penalty when interval is less than target', async function () {
	// 	const lib = await loadFixture(setup)
	// 	await lib.update()

	// const expectedPenalty = 0.025
	// await expect(lib.update()).to.emit(lib, 'UpdateResult').withArgs(0)
	// })

	// it('should correctly update EMA over multiple calls', async function () {
	// 	const lib = await loadFixture(setup)
	// 	for (let i = 0; i < 5; i++) {
	// 		await lib.update()
	// 		await time.increase(10) // Consistently call every 10 seconds
	// 	}
	// 	const state = await lib.state()
	// 	expect(state.emaInterval).to.be.lt(ethers.utils.parseUnits('15', 18)) // EMA should be less than 15 seconds
	// })

	// it('should increase penalty for consecutive rapid calls', async function () {
	// 	const lib = await loadFixture(setup)
	// 	let previousPenalty = 0
	// 	for (let i = 0; i < 5; i++) {
	// 		await time.increase(5) // Call every 5 seconds (less than target)

	// 		const tx = await lib.update()
	// 		const receipt = await tx.wait()
	// 		const event = receipt?.events?.find((e) => e.event === 'Updated')
	// 		const penalty = event?.args?.[0]

	// 		expect(penalty).to.be.gte(previousPenalty) // Penalty should increase or stay the same
	// 		previousPenalty = penalty
	// 	}
	// })
})
