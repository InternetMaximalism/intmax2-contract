import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { DepositLibTest } from '../../typechain-types'
import { getDepositHash } from '../common.test'

describe('DepositLib', function () {
	async function deployContractFixture(): Promise<DepositLibTest> {
		const DepositLibTest = await ethers.getContractFactory('DepositLibTest')
		const testLibrary = await DepositLibTest.deploy()
		return testLibrary
	}

	describe('getHash', function () {
		it('should return the correct hash for a deposit', async function () {
			const testLibrary = await loadFixture(deployContractFixture)

			const depositor = ethers.Wallet.createRandom().address
			const recipientSaltHash = ethers.randomBytes(32)
			const tokenIndex = 123
			const amount = ethers.parseEther('1.5')
			const isEligible = true

			const hash = await testLibrary.getHash(
				depositor,
				recipientSaltHash,
				amount,
				tokenIndex,
				isEligible,
			)

			// Calculate expected hash
			const expectedHash = getDepositHash(
				depositor,
				recipientSaltHash,
				amount,
				tokenIndex,
				isEligible,
			)

			expect(hash).to.equal(expectedHash)
		})

		it('should return different hashes for different deposits', async function () {
			const testLibrary = await loadFixture(deployContractFixture)

			const depositor1 = ethers.Wallet.createRandom().address
			const recipientSaltHash1 = ethers.randomBytes(32)
			const amount1 = ethers.parseEther('1.5')
			const tokenIndex1 = 123
			const isEligible1 = true

			const depositor2 = ethers.Wallet.createRandom().address
			const recipientSaltHash2 = ethers.randomBytes(32)
			const amount2 = ethers.parseEther('2.5')
			const tokenIndex2 = 456
			const isEligible2 = false

			const hash1 = await testLibrary.getHash(
				depositor1,
				recipientSaltHash1,
				amount1,
				tokenIndex1,
				isEligible1,
			)
			const hash2 = await testLibrary.getHash(
				depositor2,
				recipientSaltHash2,
				amount2,
				tokenIndex2,
				isEligible2,
			)

			expect(hash1).to.not.equal(hash2)
		})

		it('should handle extreme values correctly', async function () {
			const testLibrary = await loadFixture(deployContractFixture)

			const depositor = ethers.ZeroAddress
			const recipientSaltHash = ethers.ZeroHash
			const amount = ethers.MaxUint256
			const tokenIndex = 0
			const isEligible = false

			const hash = await testLibrary.getHash(
				depositor,
				recipientSaltHash,
				amount,
				tokenIndex,
				isEligible,
			)

			// Calculate expected hash
			const expectedHash = getDepositHash(
				depositor,
				recipientSaltHash,
				amount,
				tokenIndex,
				isEligible,
			)

			expect(hash).to.equal(expectedHash)
		})
	})
})
