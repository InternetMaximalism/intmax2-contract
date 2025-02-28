import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import {
	ERC20CallOptionalLibTest,
	TestERC20,
	TestTokenUSDT,
} from '../../../typechain-types'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadPairingData } from '../../../utils/rollup'

describe('ERC20CallOptionalLib', function () {
	type TestObjects = {
		lib: ERC20CallOptionalLibTest
		erc20: TestERC20
		usdt: TestTokenUSDT
	}
	type Signers = {
		deployer: HardhatEthersSigner
	}
	const getSigners = async (): Promise<Signers> => {
		const [deployer] = await ethers.getSigners()
		return {
			deployer,
		}
	}
	const setup = async (): Promise<TestObjects> => {
		const { deployer } = await getSigners()
		const libFactory = await ethers.getContractFactory(
			'ERC20CallOptionalLibTest',
		)
		const lib = await libFactory.deploy()
		const erc20Factory = await ethers.getContractFactory('TestERC20')
		const erc20 = await erc20Factory.deploy(deployer.address)
		const usdtFactory = await ethers.getContractFactory('TestTokenUSDT')
		const usdt = await usdtFactory.deploy('usdt', 'USDT')
		const libAddress = await lib.getAddress()
		await erc20.transfer(libAddress, 1000)
		await usdt.transfer(libAddress, 1000)

		return { lib, erc20, usdt }
	}

	describe('ERC20CallOptionalLibTest', function () {
		describe('erc20', function () {
			it('Call callOptionalReturnBool with a valid ERC20 address', async function () {
				const { lib, erc20 } = await loadFixture(setup)
				const wallet = await ethers.Wallet.createRandom()
				await lib.callOptionalReturnBool(
					await erc20.getAddress(),
					wallet.address,
					100,
				)
				expect(await lib.result()).to.be.true
			})

			it('Call callOptionalReturnBool with an invalid address', async function () {
				const { lib } = await loadFixture(setup)
				const invalidAddress = ethers.ZeroAddress
				const wallet = await ethers.Wallet.createRandom()
				await lib.callOptionalReturnBool(invalidAddress, wallet.address, 100)
				expect(await lib.result()).to.be.false
			})

			it('Call callOptionalReturnBool with insufficient balance', async function () {
				const { lib, erc20 } = await loadFixture(setup)
				const wallet = await ethers.Wallet.createRandom()
				await lib.callOptionalReturnBool(
					await erc20.getAddress(),
					wallet.address,
					1000000000,
				)
				expect(await lib.result()).to.be.false
			})
		})
		describe('usdt', function () {
			it('Call callOptionalReturnBool with a valid USDT address', async function () {
				const { lib, usdt } = await loadFixture(setup)
				const wallet = await ethers.Wallet.createRandom()
				await lib.callOptionalReturnBool(
					await usdt.getAddress(),
					wallet.address,
					100,
				)
				expect(await lib.result()).to.be.true
			})

			it('Call callOptionalReturnBool with an invalid address', async function () {
				const { lib } = await loadFixture(setup)
				const invalidAddress = ethers.ZeroAddress
				const wallet = await ethers.Wallet.createRandom()
				await lib.callOptionalReturnBool(invalidAddress, wallet.address, 100)
				expect(await lib.result()).to.be.false
			})

			it('Call callOptionalReturnBool with insufficient balance', async function () {
				const { lib, usdt } = await loadFixture(setup)
				const wallet = await ethers.Wallet.createRandom()
				await lib.callOptionalReturnBool(
					await usdt.getAddress(),
					wallet.address,
					1000000000,
				)
				expect(await lib.result()).to.be.false
			})
		})
	})
})
