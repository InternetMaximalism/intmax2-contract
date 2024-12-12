import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { WithdrawalLibTest } from '../../typechain-types'

describe('WithdrawalLib', function () {
	async function deployContractFixture(): Promise<WithdrawalLibTest> {
		const WithdrawalLibTest =
			await ethers.getContractFactory('WithdrawalLibTest')
		const testLibrary = await WithdrawalLibTest.deploy()
		return testLibrary
	}

	describe('getHash', function () {
		it('should return the correct hash for a withdrawal', async function () {
			const testLibrary = await loadFixture(deployContractFixture)

			const recipient = ethers.Wallet.createRandom().address
			const tokenIndex = 123
			const amount = ethers.parseEther('1.5')
			const nullifier = ethers.encodeBytes32String('test')

			const hash = await testLibrary.getHash(
				recipient,
				tokenIndex,
				amount,
				nullifier,
			)

			// Calculate expected hash
			const expectedHash = ethers.keccak256(
				ethers.solidityPacked(
					['address', 'uint32', 'uint256', 'bytes32'],
					[recipient, tokenIndex, amount, nullifier],
				),
			)

			expect(hash).to.equal(expectedHash)
		})

		it('should return different hashes for different withdrawals', async function () {
			const testLibrary = await loadFixture(deployContractFixture)

			const recipient1 = ethers.Wallet.createRandom().address
			const tokenIndex1 = 123
			const amount1 = ethers.parseEther('1.5')
			const nullifier1 = ethers.encodeBytes32String('test1')

			const recipient2 = ethers.Wallet.createRandom().address
			const tokenIndex2 = 456
			const amount2 = ethers.parseEther('2.5')
			const nullifier2 = ethers.encodeBytes32String('test2')

			const hash1 = await testLibrary.getHash(
				recipient1,
				tokenIndex1,
				amount1,
				nullifier1,
			)
			const hash2 = await testLibrary.getHash(
				recipient2,
				tokenIndex2,
				amount2,
				nullifier2,
			)

			expect(hash1).to.not.equal(hash2)
		})

		it('should handle extreme values correctly', async function () {
			const testLibrary = await loadFixture(deployContractFixture)

			const recipient = ethers.ZeroAddress
			const tokenIndex = 0
			const amount = ethers.MaxUint256
			const nullifier = ethers.encodeBytes32String('zzzzzzzzzzzzzzzzzzz')

			const hash = await testLibrary.getHash(
				recipient,
				tokenIndex,
				amount,
				nullifier,
			)

			// Calculate expected hash
			const expectedHash = ethers.keccak256(
				ethers.solidityPacked(
					['address', 'uint32', 'uint256', 'bytes32'],
					[recipient, tokenIndex, amount, nullifier],
				),
			)

			expect(hash).to.equal(expectedHash)
		})
	})

	describe('createWithdrawal', function () {
		it('should create a withdrawal with correct values', async function () {
			const testLibrary = await loadFixture(deployContractFixture)

			const recipient = ethers.Wallet.createRandom().address
			const tokenIndex = 123
			const amount = ethers.parseEther('1.5')
			const nullifier = ethers.encodeBytes32String('test1')

			const withdrawal = await testLibrary.createWithdrawal(
				recipient,
				tokenIndex,
				amount,
				nullifier,
			)

			expect(withdrawal.recipient).to.equal(recipient)
			expect(withdrawal.tokenIndex).to.equal(tokenIndex)
			expect(withdrawal.amount).to.equal(amount)
			expect(withdrawal.nullifier).to.equal(nullifier)
		})
	})
})
