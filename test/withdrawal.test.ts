import { ethers, upgrades } from 'hardhat'
import type { Withdrawal } from '../typechain-types/contracts/withdrawal'
import { BlockBuilderRegistry, Contribution, Rollup } from '../typechain-types'
import { loadWithdrawalInfo, makeWithdrawalInfo } from '../utils/withdrawal'
import { loadFullBlocks, postBlock } from '../utils/rollup'
import { getRandomSalt } from '../utils/rand'

describe('Withdrawal', function () {
	let registry: BlockBuilderRegistry
	let rollup: Rollup
	let withdrawal: Withdrawal

	this.beforeEach(async function () {
		const admin = (await ethers.getSigners())[1]
		const registryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistry',
		)
		registry = (await upgrades.deployProxy(registryFactory, [], {
			initializer: false,
			kind: 'uups',
			unsafeAllow: ['constructor'],
		})) as unknown as BlockBuilderRegistry

		const contributionFactory = await ethers.getContractFactory('Contribution')
		const contribution = (await upgrades.deployProxy(
			contributionFactory,
			[admin.address],
			{
				kind: 'uups',
				unsafeAllow: ['constructor'],
			},
		)) as unknown as Contribution

		const tmpAddress = ethers.Wallet.createRandom().address
		const rollupFactory = await ethers.getContractFactory('Rollup')
		rollup = (await upgrades.deployProxy(rollupFactory, [], {
			initializer: false,
			kind: 'uups',
			unsafeAllow: ['constructor'],
		})) as unknown as Rollup
		await rollup.initialize(
			admin.address,
			tmpAddress,
			tmpAddress,
			await contribution.getAddress(),
		)
		const rollupAddress = await rollup.getAddress()

		const mockPlonkVerifierFactory =
			await ethers.getContractFactory('MockPlonkVerifier')
		const mockPlonkVerifier = await mockPlonkVerifierFactory.deploy()
		const mockPlonkVerifierAddress = await mockPlonkVerifier.getAddress()

		const mockL2MessengerFactory = await ethers.getContractFactory(
			'MockL2ScrollMessenger',
		)
		const mockL2ScrollMessenger = await mockL2MessengerFactory.deploy()
		const mockL2ScrollMessengerAddress =
			await mockL2ScrollMessenger.getAddress()

		const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
		withdrawal = (await upgrades.deployProxy(withdrawalFactory, [], {
			initializer: false,
			kind: 'uups',
			unsafeAllow: ['constructor'],
		})) as unknown as Withdrawal

		await withdrawal.initialize(
			admin.address,
			mockL2ScrollMessengerAddress,
			mockPlonkVerifierAddress,
			ethers.Wallet.createRandom().address,
			rollupAddress,
			await contribution.getAddress(),
			[],
		)
		await contribution
			.connect(admin)
			.grantRole(
				ethers.solidityPackedKeccak256(['string'], ['CONTRIBUTOR']),
				withdrawal,
			)
		await contribution
			.connect(admin)
			.grantRole(
				ethers.solidityPackedKeccak256(['string'], ['CONTRIBUTOR']),
				rollup,
			)
	})

	it('should be able to submit withdraw', async function () {
		// post blocks corresponding to the withdrawal
		// notice this data has to be consistent with the withdrawal data
		await registry.updateBlockBuilder('http://example.com')
		const fullBlocks = loadFullBlocks()
		for (let i = 1; i < 3; i++) {
			await postBlock(fullBlocks[i], rollup)
		}
		const withdrawalInfo = loadWithdrawalInfo()
		await withdrawal.submitWithdrawalProof(
			withdrawalInfo.withdrawals,
			withdrawalInfo.withdrawalProofPublicInputs,
			'0x',
		)
	})

	it('should make dummy withdrawal', async function () {
		await registry.updateBlockBuilder('http://example.com')
		const fullBlocks = loadFullBlocks()
		for (let i = 1; i < 3; i++) {
			await postBlock(fullBlocks[i], rollup)
		}
		const blockNumber = 2
		const blockHash = await rollup.blockHashes(blockNumber)
		const recipient = (await ethers.getSigners())[0].address
		const singleWithdrawal = {
			recipient,
			tokenIndex: 0,
			amount: ethers.parseEther('0.1').toString(),
			nullifier: getRandomSalt(),
			blockHash,
			blockNumber,
		}
		const withdrawalInfo = makeWithdrawalInfo(recipient, [singleWithdrawal])
		await withdrawal.submitWithdrawalProof(
			withdrawalInfo.withdrawals,
			withdrawalInfo.withdrawalProofPublicInputs,
			'0x',
		)
	})
})
