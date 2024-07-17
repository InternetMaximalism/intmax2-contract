import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { type BlockBuilderInfoLibTest } from '../../typechain-types/contracts/test/block-builder-registry/BlockBuilderInfoLibTest'
import { IBlockBuilderRegistry } from '../../typechain-types/contracts/block-builder-registry/IBlockBuilderRegistry'
import { ONE_DAY_SECONDS } from './const.test'

describe('BlockBuilderInfoLib', () => {
	const MIN_STAKE_AMOUNT = ethers.parseEther('0.1')
	async function setup(): Promise<BlockBuilderInfoLibTest> {
		const lib = await ethers.deployContract('BlockBuilderInfoLibTest')
		return lib
	}

	const getDefaultBlockBuilderInfo = (
		_stakeAmount = 0n,
		_stopTime = 0,
	): IBlockBuilderRegistry.BlockBuilderInfoStruct => {
		return {
			blockBuilderUrl: '',
			stakeAmount: _stakeAmount,
			stopTime: _stopTime,
			numSlashes: 0,
			isValid: false,
		}
	}
	describe('isStaking', () => {
		it('staking', async () => {
			const lib = await loadFixture(setup)
			const value = await lib.isStaking(getDefaultBlockBuilderInfo(1n))
			expect(value).to.true
		})
		it('not staking', async () => {
			const lib = await loadFixture(setup)
			const value = await lib.isStaking(getDefaultBlockBuilderInfo())
			expect(value).to.false
		})
	})
	describe('isChallengeDuration', () => {
		it('challenge duration', async () => {
			const lib = await loadFixture(setup)
			const currentTimestamp = await time.latest()
			const stopTime = currentTimestamp - ONE_DAY_SECONDS
			const value = await lib.isChallengeDuration(
				getDefaultBlockBuilderInfo(0n, stopTime),
			)
			expect(value).to.true
		})
		it('not challenge duration', async () => {
			const lib = await loadFixture(setup)
			const currentTimestamp = await time.latest()
			const stopTime = currentTimestamp - ONE_DAY_SECONDS + 1
			const value = await lib.isChallengeDuration(
				getDefaultBlockBuilderInfo(0n, stopTime),
			)
			expect(value).to.false
		})
	})
	describe('isValidBlockBuilder', () => {
		it('valid block builder', async () => {
			const lib = await loadFixture(setup)
			const value = await lib.isValidBlockBuilder(
				getDefaultBlockBuilderInfo(MIN_STAKE_AMOUNT),
			)
			expect(value).to.true
		})
		it('invalid block builder', async () => {
			const lib = await loadFixture(setup)
			const value = await lib.isValidBlockBuilder(
				getDefaultBlockBuilderInfo(MIN_STAKE_AMOUNT - 1n),
			)
			expect(value).to.false
		})
	})
})
