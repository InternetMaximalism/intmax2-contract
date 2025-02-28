import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { encodeBytes32String } from 'ethers'

import { ChainedClaimLibTest } from '../../../typechain-types'

describe('ChainedClaimLibTest', () => {
	const setup = async (): Promise<ChainedClaimLibTest> => {
		const chainedClaimLibTestFactory = await ethers.getContractFactory(
			'ChainedClaimLibTest',
		)
		const lib = await chainedClaimLibTestFactory.deploy()
		return lib
	}

	describe('verifyClaimChain', () => {
		it('should return true if the claim chain is valid', async () => {
			const lib = await loadFixture(setup)
			const chainedClaims = [
				{
					recipient: ethers.ZeroAddress,
					amount: 1,
					nullifier: encodeBytes32String('claim1'),
					blockHash: encodeBytes32String('hash1'),
					blockNumber: 1,
				},
				{
					recipient: ethers.ZeroAddress,
					amount: 2,
					nullifier: encodeBytes32String('claim2'),
					blockHash: encodeBytes32String('hash2'),
					blockNumber: 2,
				},
			]
			expect(
				await lib.verifyClaimChain(
					chainedClaims,
					'0x706f58db10ec2a4758cf48d239690dbfb704e2dba1470f0253e539b7d29f8c3f',
				),
			).to.be.true
		})
		it('should return false if the claim chain is not valid', async () => {
			const lib = await loadFixture(setup)
			const chainedClaims = [
				{
					recipient: ethers.ZeroAddress,
					amount: 1,
					nullifier: encodeBytes32String('claim1'),
					blockHash: encodeBytes32String('hash1'),
					blockNumber: 1,
				},
				{
					recipient: ethers.ZeroAddress,
					amount: 2,
					nullifier: encodeBytes32String('claim2'),
					blockHash: encodeBytes32String('hash2'),
					blockNumber: 2,
				},
			]
			expect(
				await lib.verifyClaimChain(
					chainedClaims,
					encodeBytes32String('hogehoge'),
				),
			).to.be.false
		})
	})
})
