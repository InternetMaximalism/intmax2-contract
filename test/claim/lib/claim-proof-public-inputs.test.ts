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
				'10441966816637373847548462612560686192032977703521318278231144091840607635594',
			)
		})
	})
})
