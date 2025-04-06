import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { PairingLibTest } from '../../../typechain-types'
import block1 from '../../../test_data/block1.json'
import { loadPairingData } from '../../../scripts/utils/rollup'

describe('PairingLibTest', function () {
	const setup = async (): Promise<PairingLibTest> => {
		const PairingLibTest = await ethers.getContractFactory('PairingLibTest')
		return await PairingLibTest.deploy()
	}

	it('should return true', async function () {
		const lib = await loadFixture(setup)

		const aggregatedPublicKey: [string, string] = [
			block1.signature.aggPubkey[0],
			block1.signature.aggPubkey[1],
		]
		const aggregatedSignature: [string, string, string, string] = [
			block1.signature.aggSignature[0],
			block1.signature.aggSignature[1],
			block1.signature.aggSignature[2],
			block1.signature.aggSignature[3],
		]
		const messagePoint: [string, string, string, string] = [
			block1.signature.messagePoint[0],
			block1.signature.messagePoint[1],
			block1.signature.messagePoint[2],
			block1.signature.messagePoint[3],
		]

		const result = await lib.pairing(
			aggregatedPublicKey,
			aggregatedSignature,
			messagePoint,
		)

		expect(result).to.be.true
	})

	it('should return false', async function () {
		const pairingData = loadPairingData()
		const lib = await loadFixture(setup)

		const aggregatedPublicKey: [string, string] = [
			pairingData.aggPubkey[0],
			pairingData.aggPubkey[1],
		]
		const aggregatedSignature: [string, string, string, string] = [
			pairingData.aggSignature[0],
			pairingData.aggSignature[1],
			pairingData.aggSignature[2],
			pairingData.aggSignature[3],
		]
		const messagePoint: [string, string, string, string] = [
			pairingData.messagePoint[0],
			pairingData.messagePoint[1],
			pairingData.messagePoint[2],
			pairingData.messagePoint[3],
		]

		const result = await lib.pairing(
			aggregatedPublicKey,
			aggregatedSignature,
			messagePoint,
		)

		expect(result).to.be.false
	})

	// TODO
	// it('revert PairingOpCodeFailed', async function () {
	// })
})
