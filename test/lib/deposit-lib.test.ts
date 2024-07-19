import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { type DepositLibTest } from '../../typechain-types/contracts/test/lib/DepositLibTest'

describe('DepositLib', () => {
	async function setup(): Promise<DepositLibTest> {
		const lib = await ethers.deployContract('DepositLibTest')
		return lib
	}

	function getDefaultDeposit(
		recipientSaltHash: string = ethers.ZeroHash,
		tokenIndex: number = 0,
		amount: bigint = 0n,
	): { recipientSaltHash: string; tokenIndex: number; amount: bigint } {
		return { recipientSaltHash, tokenIndex, amount }
	}

	describe('getHash', () => {
		it('should return the correct hash for a deposit', async () => {
			const lib = await loadFixture(setup)
			const deposit = getDefaultDeposit(
				'0x1234567890123456789012345678901234567890123456789012345678901234',
				1,
				1000n,
			)
			const expectedHash = ethers.keccak256(
				ethers.solidityPacked(
					['bytes32', 'uint32', 'uint256'],
					[deposit.recipientSaltHash, deposit.tokenIndex, deposit.amount],
				),
			)
			const actualHash = await lib.getHash(deposit)
			expect(actualHash).to.equal(expectedHash)
		})

		it('should return different hashes for different deposits', async () => {
			const lib = await loadFixture(setup)
			const deposit1 = getDefaultDeposit(
				'0x1234567890123456789012345678901234567890123456789012345678901234',
				1,
				1000n,
			)
			const deposit2 = getDefaultDeposit(
				'0x1234567890123456789012345678901234567890123456789012345678901234',
				1,
				2000n,
			)
			const hash1 = await lib.getHash(deposit1)
			const hash2 = await lib.getHash(deposit2)
			expect(hash1).to.not.equal(hash2)
		})
	})
})
