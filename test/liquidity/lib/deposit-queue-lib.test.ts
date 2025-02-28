import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { DepositQueueLibTest } from '../../../typechain-types'

describe('DepositQueueLib', function () {
	const setup = async (): Promise<DepositQueueLibTest> => {
		const libFactory = await ethers.getContractFactory('DepositQueueLibTest')
		const lib = await libFactory.deploy()
		return lib
	}

	describe('initialize', function () {
		it('should initialize correctly', async function () {
			const lib = await loadFixture(setup)
			expect(await lib.getFront()).to.equal(1)
			expect(await lib.getRear()).to.equal(1)
		})
	})

	describe('enqueue', function () {
		it('should enqueue deposits correctly', async function () {
			const lib = await loadFixture(setup)
			const [sender] = await ethers.getSigners()

			await lib.enqueue(ethers.keccak256('0x01'), sender.address)
			expect(await lib.latestDepositId()).to.equal(1)

			await lib.enqueue(ethers.keccak256('0x02'), sender.address)
			expect(await lib.latestDepositId()).to.equal(2)
		})
	})

	describe('deleteDeposit', function () {
		it('should delete deposit correctly', async function () {
			const lib = await loadFixture(setup)
			const [sender] = await ethers.getSigners()
			const depositHash = ethers.keccak256('0x01')

			await lib.enqueue(depositHash, sender.address)
			await lib.deleteDeposit(1)

			const deletedData = await lib.deletedData()
			expect(deletedData.depositHash).to.equal(depositHash)
			expect(deletedData.sender).to.equal(sender.address)
			expect(deletedData.isRejected).to.be.false

			const emptyData = await lib.getDepositData(1)
			expect(emptyData.depositHash).to.equal(
				'0x0000000000000000000000000000000000000000000000000000000000000000',
			)
			expect(emptyData.sender).to.equal(
				'0x0000000000000000000000000000000000000000',
			)
			expect(emptyData.isRejected).to.be.false
		})
	})

	describe('analyze', function () {
		describe('success', function () {
			it('should analyze deposits correctly', async function () {
				const lib = await loadFixture(setup)
				const [sender] = await ethers.getSigners()
				const depositHash1 = ethers.keccak256('0x01')
				const depositHash2 = ethers.keccak256('0x02')
				const depositHash3 = ethers.keccak256('0x03')

				await lib.enqueue(depositHash1, sender.address)
				await lib.enqueue(depositHash2, sender.address)
				await lib.enqueue(depositHash3, sender.address)

				await lib.analyze(3, [2]) // Reject deposit 2
				const depositHashes = await Promise.all(
					[...Array(2)].map((_, i) => lib.latestDepositHashes(i)),
				)

				expect(depositHashes).to.have.lengthOf(2)
				expect(depositHashes[0]).to.equal(depositHash1)
				expect(depositHashes[1]).to.equal(depositHash3)
				expect(await lib.getFront()).to.equal(4)
			})
			it('should analyze deposits correctly after deleting a middle queue item', async function () {
				const lib = await loadFixture(setup)
				const [sender] = await ethers.getSigners()
				const depositHash1 = ethers.keccak256('0x01')
				const depositHash2 = ethers.keccak256('0x02')
				const depositHash3 = ethers.keccak256('0x03')
				const depositHash4 = ethers.keccak256('0x04')
				const depositHash5 = ethers.keccak256('0x05')

				await lib.enqueue(depositHash1, sender.address)
				await lib.enqueue(depositHash2, sender.address)
				await lib.enqueue(depositHash3, sender.address)
				await lib.enqueue(depositHash4, sender.address)
				await lib.enqueue(depositHash5, sender.address)

				// Delete the middle deposit (index 3)
				await lib.deleteDeposit(3)

				// Analyze all deposits, rejecting the second one
				await lib.analyze(5, [2])
				const depositHashes = await Promise.all(
					[...Array(3)].map((_, i) => lib.latestDepositHashes(i)),
				)
				expect(depositHashes).to.have.lengthOf(3)
				expect(depositHashes[0]).to.equal(depositHash1)
				expect(depositHashes[1]).to.equal(depositHash4)
				expect(depositHashes[2]).to.equal(depositHash5)
				expect(await lib.getFront()).to.equal(6)
			})
		})

		describe('fail', function () {
			it('should revert when trying to analyze non-existent deposits', async function () {
				const lib = await loadFixture(setup)
				await expect(lib.analyze(1, []))
					.to.be.revertedWithCustomError(lib, 'TriedAnalyzeOutOfRange')
					.withArgs(1, 1, 0)
			})

			it('should revert when trying to reject out of range deposits', async function () {
				const lib = await loadFixture(setup)
				const [sender] = await ethers.getSigners()

				await lib.enqueue(ethers.keccak256('0x01'), sender.address)
				await expect(lib.analyze(1, [2]))
					.to.be.revertedWithCustomError(lib, 'TriedToRejectOutOfRange')
					.withArgs(2, 1, 1)
			})
		})
	})
})
