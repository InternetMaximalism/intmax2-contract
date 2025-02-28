import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { BlockHashLibTest } from '../../../typechain-types'

describe('BlockHashLib', function () {
	async function deployContractFixture(): Promise<BlockHashLibTest> {
		const BlockHashLibTest = await ethers.getContractFactory('BlockHashLibTest')
		const blockHashLibTest = await BlockHashLibTest.deploy()
		return blockHashLibTest
	}

	const getBlockHash = (
		prevHash: string,
		depositTreeRoot: string | Uint8Array,
		signatureHash: string | Uint8Array,
		timestamp: number,
		blockNumber: bigint,
	): string => {
		return ethers.keccak256(
			ethers.solidityPacked(
				['bytes32', 'bytes32', 'bytes32', 'uint64', 'uint32'],
				[prevHash, depositTreeRoot, signatureHash, timestamp, blockNumber],
			),
		)
	}

	describe('Genesis block', function () {
		it('should push and retrieve block hashes correctly', async function () {
			const blockHashLibTest = await loadFixture(deployContractFixture)
			const initialDepositTreeRoot = ethers.randomBytes(32)

			await blockHashLibTest.pushGenesisBlockHash(initialDepositTreeRoot)

			const depositTreeRoot = ethers.randomBytes(32)
			const signatureHash = ethers.randomBytes(32)

			const prevHash = await blockHashLibTest.getPrevHash()
			const timestamp = await time.latest()

			await blockHashLibTest.pushBlockHash(
				depositTreeRoot,
				signatureHash,
				timestamp,
			)

			const newBlockHash = await blockHashLibTest.latestBlockHash()

			const updatedBlockNumber = await blockHashLibTest.getBlockNumber()

			const expectedNewHash = getBlockHash(
				prevHash,
				depositTreeRoot,
				signatureHash,
				timestamp,
				updatedBlockNumber - 1n,
			)

			expect(newBlockHash).to.equal(
				expectedNewHash,
				"New block hash doesn't match expected hash",
			)
		})
	})

	describe('Subsequent blocks', function () {
		it('should push and retrieve block hashes correctly', async function () {
			const blockHashLibTest = await loadFixture(deployContractFixture)
			const initialDepositTreeRoot = ethers.randomBytes(32)

			await blockHashLibTest.pushGenesisBlockHash(initialDepositTreeRoot)

			const depositTreeRoot = ethers.randomBytes(32)
			const signatureHash = ethers.randomBytes(32)

			const prevHash = await blockHashLibTest.getPrevHash()
			const blockNumberBeforePush = await blockHashLibTest.getBlockNumber()
			const timestamp = await time.latest()

			await blockHashLibTest.pushBlockHash(
				depositTreeRoot,
				signatureHash,
				timestamp,
			)
			const newBlockHash = await blockHashLibTest.latestBlockHash()

			const latestBlockHash = await blockHashLibTest.latestBlockHash()
			expect(latestBlockHash).to.equal(
				newBlockHash,
				'Latest block hash should match the newly added block hash',
			)

			const updatedBlockNumber = await blockHashLibTest.getBlockNumber()
			expect(updatedBlockNumber).to.equal(
				blockNumberBeforePush + 1n,
				'Block number should be incremented by 1',
			)

			const expectedNewHash = getBlockHash(
				prevHash,
				depositTreeRoot,
				signatureHash,
				timestamp,
				blockNumberBeforePush,
			)

			expect(newBlockHash).to.equal(
				expectedNewHash,
				"New block hash doesn't match expected hash",
			)

			// Verify that getPrevHash now returns the new block hash
			const updatedPrevHash = await blockHashLibTest.getPrevHash()
			expect(updatedPrevHash).to.equal(
				newBlockHash,
				'Updated previous hash should match the new block hash',
			)
		})
	})

	describe('Error handling', function () {
		it('should correctly handle the state after adding the genesis block', async function () {
			const blockHashLibTest = await loadFixture(deployContractFixture)

			const initialDepositTreeRoot = ethers.randomBytes(32)
			await blockHashLibTest.pushGenesisBlockHash(initialDepositTreeRoot)

			const blockNumber = await blockHashLibTest.getBlockNumber()
			expect(blockNumber).to.equal(
				1n,
				'Block number should be 0 after adding genesis block',
			)

			const prevHash = await blockHashLibTest.getPrevHash()
			expect(prevHash).to.be.properHex(
				64,
				'Previous hash should be a valid 32-byte hex string',
			)

			const genesisBlockHash = await blockHashLibTest.getBlockHash(0)
			expect(prevHash).to.equal(
				genesisBlockHash,
				'Previous hash should match genesis block hash',
			)

			const latestBlockHash = await blockHashLibTest.latestBlockHash()
			expect(latestBlockHash).to.equal(
				genesisBlockHash,
				'Latest block hash should match genesis block hash',
			)
		})
	})
})
