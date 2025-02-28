import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'

import { DepositLimitTest } from '../../../typechain-types'

describe('DepositLimitTest', () => {
	const setup = async (): Promise<DepositLimitTest> => {
		const depositLimitTestFactory =
			await ethers.getContractFactory('DepositLimitTest')
		const lib = await depositLimitTestFactory.deploy()
		return lib
	}

	describe('getDepositLimit', () => {
		// index
		const ETH_INDEX = 0
		const WBTC_INDEX = 2
		const USDC_INDEX = 3

		// eth limits
		const ETH_LIMIT_0 = ethers.parseEther('100')
		const ETH_LIMIT_1 = ethers.parseEther('500')
		const ETH_LIMIT_2 = ethers.parseEther('1000')
		const ETH_LIMIT_3 = ethers.parseEther('5000')
		const ETH_LIMIT_4 = ethers.parseEther('10000')

		// wbtc limits
		const WBTC_LIMIT_0 = 500000000 // 0.5 BTC
		const WBTC_LIMIT_1 = 1000000000 // 1 BTC
		const WBTC_LIMIT_2 = 5000000000 // 5 BTC
		const WBTC_LIMIT_3 = 10000000000 // 10 BTC
		const WBTC_LIMIT_4 = 50000000000 // 50 BTC

		// usdc limits
		const USDC_LIMIT_0 = 500000000000 // 500k USDC
		const USDC_LIMIT_1 = 1000000000000 // 1M USDC
		const USDC_LIMIT_2 = 5000000000000 // 5M USDC
		const USDC_LIMIT_3 = 10000000000000 // 10M USDC
		const USDC_LIMIT_4 = 50000000000000 // 50M USDC

		// period
		const PERIOD_1 = 182 // 0.5y
		const PERIOD_2 = 364 // 1y
		const PERIOD_3 = 546 // 1.5y
		const PERIOD_4 = 728 // 2y

		const ONE_DAY_TIME_OF_SECONDS = 60 * 60 * 24

		it('If it is not the specified tokenindex, max(uint256) is returned.', async () => {
			const lib = await loadFixture(setup)
			expect(await lib.getDepositLimit(1, 0)).to.be.equal(ethers.MaxUint256)
			expect(await lib.getDepositLimit(4, 0)).to.be.equal(ethers.MaxUint256)
			expect(await lib.getDepositLimit(5, 0)).to.be.equal(ethers.MaxUint256)
		})
		it('If the specified timestamp is greater than the current, the specified maximum value is returned.', async () => {
			const lib = await loadFixture(setup)
			expect(
				await lib.getDepositLimit(ETH_INDEX, ethers.MaxUint256),
			).to.be.equal(ETH_LIMIT_0)
			expect(
				await lib.getDepositLimit(WBTC_INDEX, ethers.MaxUint256),
			).to.be.equal(WBTC_LIMIT_0)
			expect(
				await lib.getDepositLimit(USDC_INDEX, ethers.MaxUint256),
			).to.be.equal(USDC_LIMIT_0)
		})
		it('If the specified timestamp is less than the current, a value corresponding to the period is returned.', async () => {
			const lib = await loadFixture(setup)
			const currentTimestamp = await time.latest()

			// ETH
			let daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_4
			expect(await lib.getDepositLimit(ETH_INDEX, daysElapsed)).to.be.equal(
				ETH_LIMIT_4,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_3
			expect(await lib.getDepositLimit(ETH_INDEX, daysElapsed)).to.be.equal(
				ETH_LIMIT_3,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_2
			expect(await lib.getDepositLimit(ETH_INDEX, daysElapsed)).to.be.equal(
				ETH_LIMIT_2,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_1
			expect(await lib.getDepositLimit(ETH_INDEX, daysElapsed)).to.be.equal(
				ETH_LIMIT_1,
			)
			daysElapsed = currentTimestamp - 1
			expect(await lib.getDepositLimit(ETH_INDEX, daysElapsed)).to.be.equal(
				ETH_LIMIT_0,
			)

			// WBTC
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_4
			expect(await lib.getDepositLimit(WBTC_INDEX, daysElapsed)).to.be.equal(
				WBTC_LIMIT_4,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_3
			expect(await lib.getDepositLimit(WBTC_INDEX, daysElapsed)).to.be.equal(
				WBTC_LIMIT_3,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_2
			expect(await lib.getDepositLimit(WBTC_INDEX, daysElapsed)).to.be.equal(
				WBTC_LIMIT_2,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_1
			expect(await lib.getDepositLimit(WBTC_INDEX, daysElapsed)).to.be.equal(
				WBTC_LIMIT_1,
			)
			daysElapsed = currentTimestamp - 1
			expect(await lib.getDepositLimit(WBTC_INDEX, daysElapsed)).to.be.equal(
				WBTC_LIMIT_0,
			)

			// USDC
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_4
			expect(await lib.getDepositLimit(USDC_INDEX, daysElapsed)).to.be.equal(
				USDC_LIMIT_4,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_3
			expect(await lib.getDepositLimit(USDC_INDEX, daysElapsed)).to.be.equal(
				USDC_LIMIT_3,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_2
			expect(await lib.getDepositLimit(USDC_INDEX, daysElapsed)).to.be.equal(
				USDC_LIMIT_2,
			)
			daysElapsed = currentTimestamp - ONE_DAY_TIME_OF_SECONDS * PERIOD_1
			expect(await lib.getDepositLimit(USDC_INDEX, daysElapsed)).to.be.equal(
				USDC_LIMIT_1,
			)
			daysElapsed = currentTimestamp - 1
			expect(await lib.getDepositLimit(USDC_INDEX, daysElapsed)).to.be.equal(
				USDC_LIMIT_0,
			)
		})
	})
})
