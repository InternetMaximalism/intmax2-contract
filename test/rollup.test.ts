import { ethers, upgrades } from 'hardhat'
import type {
	BlockBuilderRegistry,
	Contribution,
	MockL2ScrollMessenger,
	Rollup,
} from '../typechain-types'
import { expect } from 'chai'
import { loadFullBlocks, postBlock } from '../utils/rollup'
import { getRandomSalt } from '../utils/rand'

describe('Rollup', function () {
	let mockL2ScrollMessenger: MockL2ScrollMessenger
	let registry: BlockBuilderRegistry
	let rollup: Rollup
	let liquidityAddress: string

	this.beforeEach(async function () {
		const admin = (await ethers.getSigners())[1]
		const mockL2ScrollMessengerFactory = await ethers.getContractFactory(
			'MockL2ScrollMessenger',
		)
		mockL2ScrollMessenger = await mockL2ScrollMessengerFactory.deploy()

		const registryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistry',
		)
		registry = (await upgrades.deployProxy(registryFactory, [], {
			initializer: false,
			kind: 'uups',
			unsafeAllow: ['constructor'],
		})) as unknown as BlockBuilderRegistry

		const rollupFactory = await ethers.getContractFactory('Rollup')
		rollup = (await upgrades.deployProxy(rollupFactory, [], {
			initializer: false,
			kind: 'uups',
			unsafeAllow: ['constructor'],
		})) as unknown as Rollup

		const contributionFactory = await ethers.getContractFactory('Contribution')
		const contribution = (await upgrades.deployProxy(
			contributionFactory,
			[admin.address],
			{
				kind: 'uups',
				unsafeAllow: ['constructor'],
			},
		)) as unknown as Contribution
		liquidityAddress = ethers.Wallet.createRandom().address
		await rollup.initialize(
			admin.address,
			await mockL2ScrollMessenger.getAddress(),
			liquidityAddress,
			await contribution.getAddress(),
		)
		await contribution
			.connect(admin)
			.grantRole(
				ethers.solidityPackedKeccak256(['string'], ['CONTRIBUTOR']),
				rollup,
			)
	})

	it('should match block hashes', async function () {
		await registry.updateBlockBuilder('http://example.com')
		const fullBlocks = loadFullBlocks()
		for (let i = 1; i < 3; i++) {
			await postBlock(fullBlocks[i], rollup)
		}
		let blockHashes = []
		for (let i = 0; i < 3; i++) {
			const blockHash = await rollup.blockHashes(i)
			blockHashes.push(blockHash)
		}
		expect(blockHashes[0]).to.equal(fullBlocks[0].blockHash)
		expect(blockHashes[1]).to.equal(fullBlocks[1].blockHash)
		expect(blockHashes[2]).to.equal(fullBlocks[2].blockHash)
	})

	const calcProcessDepositsGas = async (
		depositHashes: string[],
	): Promise<bigint> => {
		const message = rollup.interface.encodeFunctionData('processDeposits', [
			0,
			depositHashes,
		])
		const tx = await mockL2ScrollMessenger.relayMessage(
			liquidityAddress,
			await rollup.getAddress(),
			0,
			0,
			message,
		)
		const receipt = await tx.wait()
		if (!receipt) {
			throw new Error('no receipt')
		}
		return receipt.gasUsed
	}

	it('process deposit gas for 1 deposit', async function () {
		console.log(
			'Gas for 1 hash:',
			await calcProcessDepositsGas([getRandomSalt()]),
		)
	})

	it('process deposit gas for 2 deposit', async function () {
		console.log(
			'Gas for 2 hashes:',
			await calcProcessDepositsGas([getRandomSalt(), getRandomSalt()]),
		)
	})

	it('process deposit gas for 4 deposit', async function () {
		console.log(
			'Gas for 4 hashes:',
			await calcProcessDepositsGas([
				getRandomSalt(),
				getRandomSalt(),
				getRandomSalt(),
				getRandomSalt(),
			]),
		)
	})
})
