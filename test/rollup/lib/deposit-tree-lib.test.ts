import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { DepositTreeLibTest } from '../../../typechain-types'
import { getDepositHash } from '../../common.test'

describe('DepositTreeLibTest', function () {
	const setup = async (): Promise<DepositTreeLibTest> => {
		const factory = await ethers.getContractFactory('DepositTreeLibTest')
		return await factory.deploy()
	}

	it('should initialize with correct values', async function () {
		const lib = await loadFixture(setup)
		const count = await lib.getDepositCount()
		const defaultHash = await lib.getDefaultHash()
		const treeDepth = await lib.getTreeDepth()

		// Calculate default hash with all zero values
		const zeroBytes32 = ethers.zeroPadValue('0x', 32)
		const calculatedDefaultHash = getDepositHash(
			ethers.ZeroAddress,
			zeroBytes32,
			0n,
			0,
			false,
		)

		expect(count).to.equal(0)
		expect(defaultHash).to.equal(calculatedDefaultHash, 'Default hash mismatch')
		expect(treeDepth).to.equal(32)
	})

	it('should add deposits and update root', async function () {
		const lib = await loadFixture(setup)
		// Generate 32-byte values for recipientSaltHash
		const recipientSaltHash1 = ethers.keccak256(
			ethers.toUtf8Bytes('recipient1'),
		)
		const recipientSaltHash2 = ethers.keccak256(
			ethers.toUtf8Bytes('recipient2'),
		)

		const deposit1 = getDepositHash(
			ethers.Wallet.createRandom().address,
			recipientSaltHash1,
			1n,
			1,
			true,
		)
		const deposit2 = getDepositHash(
			ethers.Wallet.createRandom().address,
			recipientSaltHash2,
			2n,
			2,
			true,
		)

		await lib.deposit(deposit1)
		let root = await lib.getRoot()
		let count = await lib.getDepositCount()
		expect(count).to.equal(1)

		await lib.deposit(deposit2)
		let newRoot = await lib.getRoot()
		count = await lib.getDepositCount()
		expect(count).to.equal(2)
		expect(newRoot).to.not.equal(root)
	})

	it('should return correct branch', async function () {
		const lib = await loadFixture(setup)
		// Generate a 32-byte value for recipientSaltHash
		const recipientSaltHash = ethers.keccak256(
			ethers.toUtf8Bytes('testRecipient'),
		)

		const tokenIndex = 1
		const amount = ethers.parseEther('1')
		const deposit1 = getDepositHash(
			ethers.Wallet.createRandom().address,
			recipientSaltHash,
			amount,
			tokenIndex,
			true,
		)

		await lib.deposit(deposit1)

		const branch = await lib.getBranch()

		const treeDepth = await lib.getTreeDepth()

		expect(branch.length).to.equal(treeDepth)
		expect(branch[0]).to.equal(deposit1)

		// Additional checks
		expect(branch[0]).to.equal(
			deposit1,
			'First branch element should match deposit hash',
		)

		// Check other branch elements
		for (let i = 1; i < branch.length; i++) {
			expect(branch[i]).to.equal(
				ethers.ZeroHash,
				`Branch element ${i} should be zero`,
			)
		}
	})

	it('should revert when tree is full', async function () {
		const lib = await loadFixture(setup)
		const baseRecipientSaltHash = ethers.keccak256(
			ethers.toUtf8Bytes('baseRecipient'),
		)

		const tokenIndex = 1
		const amount = ethers.parseEther('1')

		// Add a number of deposits (e.g., 20)
		const numberOfDeposits = 20
		for (let i = 0; i < numberOfDeposits; i++) {
			// Modify the recipientSaltHash slightly for each deposit to ensure unique deposits
			const recipientSaltHash = ethers.keccak256(
				ethers.concat([baseRecipientSaltHash, ethers.toBeHex(i, 32)]),
			)
			const deposit = getDepositHash(
				ethers.Wallet.createRandom().address,
				recipientSaltHash,
				amount,
				tokenIndex,
				true,
			)

			await lib.deposit(deposit)
		}

		const finalCount = await lib.getDepositCount()

		// Try one more deposit to ensure it still works
		const finalRecipientSaltHash = ethers.keccak256(
			ethers.toUtf8Bytes('finalRecipient'),
		)
		const finalDeposit = getDepositHash(
			ethers.Wallet.createRandom().address,
			finalRecipientSaltHash,
			amount,
			tokenIndex,
			true,
		)

		await expect(lib.deposit(finalDeposit)).to.not.be.reverted

		const updatedCount = await lib.getDepositCount()

		expect(updatedCount).to.equal(
			finalCount + 1n,
			'Deposit count should increase by 1',
		)
	})

	// This test is skipped by default as it would take an extremely long time to run.
	it.skip('should theoretically revert with MerkleTreeFull when tree is completely full', async function () {
		const lib = await loadFixture(setup)
		const TREE_DEPTH = 32
		const MAX_DEPOSIT_COUNT = BigInt(2) ** BigInt(TREE_DEPTH) - BigInt(1) // 2^32 - 1
		const baseRecipientSaltHash = ethers.keccak256(
			ethers.toUtf8Bytes('baseRecipient'),
		)
		const tokenIndex = 1
		const amount = ethers.parseEther('1')

		// Fill the tree to its maximum capacity
		for (let i = BigInt(0); i < MAX_DEPOSIT_COUNT; i++) {
			if (i % BigInt(1000000) === BigInt(0)) {
				console.log(`Processed ${i} deposits...`)
			}
			const recipientSaltHash = ethers.keccak256(
				ethers.concat([baseRecipientSaltHash, ethers.toBeHex(i, 32)]),
			)
			const deposit = getDepositHash(
				ethers.Wallet.createRandom().address,
				recipientSaltHash,
				amount,
				Number(tokenIndex),
				true,
			)
			await lib.deposit(deposit)
		}

		// Verify the final deposit count
		const finalCount = await lib.getDepositCount()
		expect(finalCount).to.equal(
			MAX_DEPOSIT_COUNT,
			'Deposit count should equal MAX_DEPOSIT_COUNT',
		)

		// Try to add one more deposit, which should revert with MerkleTreeFull
		const extraRecipientSaltHash = ethers.keccak256(
			ethers.toUtf8Bytes('extraRecipient'),
		)
		const extraDeposit = getDepositHash(
			ethers.Wallet.createRandom().address,
			extraRecipientSaltHash,
			amount,
			Number(tokenIndex),
			true,
		)

		await expect(lib.deposit(extraDeposit)).to.be.revertedWithCustomError(
			lib,
			'MerkleTreeFull',
		)

		// Verify the deposit count hasn't changed
		const unchangedCount = await lib.getDepositCount()
		expect(unchangedCount).to.equal(
			MAX_DEPOSIT_COUNT,
			'Deposit count should remain unchanged',
		)
	})
})
