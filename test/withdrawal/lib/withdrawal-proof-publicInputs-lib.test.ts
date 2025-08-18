import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { WithdrawalProofPublicInputsLibTest } from '../../../typechain-types'

describe('WithdrawalProofPublicInputsLib', () => {
	async function setup(): Promise<WithdrawalProofPublicInputsLibTest> {
		const factory = await ethers.getContractFactory(
			'WithdrawalProofPublicInputsLibTest',
		)
		const contract = await factory.deploy()
		return contract
	}

	describe('getHash', () => {
		it('should return a consistent hash for the same inputs', async () => {
			const contract = await loadFixture(setup)

			const lastWithdrawalHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const withdrawalAggregator = ethers.Wallet.createRandom().address

			const hash1 = await contract.getHash(
				lastWithdrawalHash,
				withdrawalAggregator,
			)
			const hash2 = await contract.getHash(
				lastWithdrawalHash,
				withdrawalAggregator,
			)

			expect(hash1).to.equal(hash2)
		})

		it('should return different hashes for different inputs', async () => {
			const contract = await loadFixture(setup)

			const lastWithdrawalHash1 = ethers.keccak256(ethers.toUtf8Bytes('test1'))
			const lastWithdrawalHash2 = ethers.keccak256(ethers.toUtf8Bytes('test2'))
			const withdrawalAggregator = ethers.Wallet.createRandom().address

			const hash1 = await contract.getHash(
				lastWithdrawalHash1,
				withdrawalAggregator,
			)
			const hash2 = await contract.getHash(
				lastWithdrawalHash2,
				withdrawalAggregator,
			)

			expect(hash1).to.not.equal(hash2)
		})

		it('should match manually calculated hash', async () => {
			const contract = await loadFixture(setup)

			const lastWithdrawalHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const withdrawalAggregator = ethers.Wallet.createRandom().address

			const contractHash = await contract.getHash(
				lastWithdrawalHash,
				withdrawalAggregator,
			)
			const manualHash = ethers.keccak256(
				ethers.solidityPacked(
					['bytes32', 'address'],
					[lastWithdrawalHash, withdrawalAggregator],
				),
			)
			const mask = (1n << 253n) - 1n
			const maskedHash = BigInt(manualHash) & mask

			expect(contractHash).to.equal(maskedHash)
		})
	})

	describe('createInputs', () => {
		it('should create inputs with correct values', async () => {
			const contract = await loadFixture(setup)

			const lastWithdrawalHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const withdrawalAggregator = ethers.Wallet.createRandom().address

			const inputs = await contract.createInputs(
				lastWithdrawalHash,
				withdrawalAggregator,
			)

			expect(inputs.lastWithdrawalHash).to.equal(lastWithdrawalHash)
			expect(inputs.withdrawalAggregator).to.equal(withdrawalAggregator)
		})
	})
})
