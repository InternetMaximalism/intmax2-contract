import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { encodeBytes32String } from 'ethers'

import { ClaimProofPublicInputsLibTest } from '../../../typechain-types'

describe('ClaimProofPublicInputsLibTest', () => {
	const setup = async (): Promise<ClaimProofPublicInputsLibTest> => {
		const claimProofPublicInputsLibTestFactory =
			await ethers.getContractFactory('ClaimProofPublicInputsLibTest')
		const lib = await claimProofPublicInputsLibTestFactory.deploy()
		return lib
	}

	describe('getHash', () => {
		it('get hash', async () => {
			const lib = await loadFixture(setup)
			expect(
				await lib.getHash(encodeBytes32String('arg1'), ethers.ZeroAddress),
			).to.be.equal(
				'0xd715f19b6a5b20d5d567063de333780e7cd74aec6dccabbeaa2c8851b16f488a',
			)
		})
	})
})
