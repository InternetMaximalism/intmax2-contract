import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { ContractTransactionResponse } from 'ethers'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { ONE_DAY_SECONDS } from './const.test'

import {
	BlockBuilderRegistry,
	FraudProofPublicInputsLib,
	MockPlonkVerifier,
	RollupTestForBlockBuilderRegistry,
	IBlockBuilderRegistry,
} from '../../typechain-types'

describe('BlockBuilderRegistry', () => {
	const DUMMY_URL = 'https://dummy.com'
	const DEFAULT_BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD'
	const MIN_STAKE_AMOUNT = ethers.parseEther('0.1')
	const DUMMY_BLOCK_HASH =
		'0x8c835aff939ed6e3ef18dc601bc14623bae8527486ad0539e41a9083e25329be'
	const DUMMY_BLOCK_NUMBER = 5n
	const DUMMY_PROOF = new Uint8Array([1, 2, 3, 4, 5])
	const setup = async (): Promise<
		[BlockBuilderRegistry, RollupTestForBlockBuilderRegistry, MockPlonkVerifier]
	> => {
		const rollupFactory = await ethers.getContractFactory(
			'RollupTestForBlockBuilderRegistry',
		)
		const rollup =
			(await rollupFactory.deploy()) as unknown as RollupTestForBlockBuilderRegistry

		const verifierFactory = await ethers.getContractFactory('MockPlonkVerifier')
		const verifier =
			(await verifierFactory.deploy()) as unknown as MockPlonkVerifier

		const blockBuilderRegistryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistry',
		)
		const blockBuilderRegistry = (await upgrades.deployProxy(
			blockBuilderRegistryFactory,
			[await rollup.getAddress(), await verifier.getAddress()],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as BlockBuilderRegistry
		return [blockBuilderRegistry, rollup, verifier]
	}

	const getGasCost = async (
		res: ContractTransactionResponse,
	): Promise<bigint> => {
		const transaction = await res.wait()
		return ethers.toBigInt(transaction!.gasPrice * transaction!.gasUsed)
	}
	const getDefaultBlockBuilderInfo =
		(): IBlockBuilderRegistry.BlockBuilderInfoStruct => {
			return {
				blockBuilderUrl: '',
				stakeAmount: 0n,
				stopTime: 0n,
				numSlashes: 0n,
				isValid: false,
			}
		}

	type signers = {
		deployer: HardhatEthersSigner
		blockBuilder1: HardhatEthersSigner
		blockBuilder2: HardhatEthersSigner
		blockBuilder3: HardhatEthersSigner
		notStakedBlockBuilder: HardhatEthersSigner
		challenger: HardhatEthersSigner
		user: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [
			deployer,
			blockBuilder1,
			blockBuilder2,
			blockBuilder3,
			notStakedBlockBuilder,
			challenger,
			user,
		] = await ethers.getSigners()
		return {
			deployer,
			blockBuilder1,
			blockBuilder2,
			blockBuilder3,
			notStakedBlockBuilder,
			challenger,
			user,
		}
	}
	const checkBlockBuilderInfo = (
		blockBuilderInfo: [string, bigint, bigint, bigint, boolean] & {
			blockBuilderUrl: string
			stakeAmount: bigint
			stopTime: bigint
			numSlashes: bigint
			isValid: boolean
		},
		blockBuilderInfo2: IBlockBuilderRegistry.BlockBuilderInfoStruct,
	) => {
		expect(blockBuilderInfo.blockBuilderUrl).to.equal(
			blockBuilderInfo2.blockBuilderUrl,
		)
		expect(blockBuilderInfo.stakeAmount).to.equal(blockBuilderInfo2.stakeAmount)
		expect(blockBuilderInfo.stopTime).to.equal(blockBuilderInfo2.stopTime)
		expect(blockBuilderInfo.numSlashes).to.equal(blockBuilderInfo2.numSlashes)
		expect(blockBuilderInfo.isValid).to.equal(blockBuilderInfo2.isValid)
	}
	const getTestFraudProofPublicInputs = async (
		hash: string,
		blockNumber: bigint,
	): Promise<FraudProofPublicInputsLib.FraudProofPublicInputsStruct> => {
		const signers = await getSigners()
		return {
			blockHash: hash,
			blockNumber: blockNumber,
			challenger: signers.deployer.address,
		}
	}
	const slashBlockBuilderSetup = async (): Promise<
		[
			BlockBuilderRegistry,
			RollupTestForBlockBuilderRegistry,
			MockPlonkVerifier,
			bigint,
			FraudProofPublicInputsLib.FraudProofPublicInputsStruct,
		]
	> => {
		const [blockBuilderRegistry, rollup, verifier] = await loadFixture(setup)
		const signers = await getSigners()
		const stakeAmount = ethers.parseEther('0.11')
		await blockBuilderRegistry
			.connect(signers.blockBuilder1)
			.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
		const fraudProof = await getTestFraudProofPublicInputs(
			DUMMY_BLOCK_HASH,
			DUMMY_BLOCK_NUMBER,
		)
		await rollup.setTestData(
			fraudProof.blockNumber,
			fraudProof.blockHash,
			signers.blockBuilder1.address,
		)
		return [blockBuilderRegistry, rollup, verifier, stakeAmount, fraudProof]
	}
	describe('initialize', () => {
		describe('success', () => {
			it('should revert when initializing for the second time', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				await expect(
					blockBuilderRegistry.initialize(
						ethers.ZeroAddress,
						ethers.ZeroAddress,
					),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'InvalidInitialization',
				)
			})
			it('should set the deployer as the owner', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				expect(await blockBuilderRegistry.owner()).to.equal(
					signers.deployer.address,
				)
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					blockBuilderRegistry.initialize(tmpAddress, tmpAddress),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'InvalidInitialization',
				)
			})
			it('rollup address should not be zero address', async () => {
				const blockBuilderRegistryFactory = await ethers.getContractFactory(
					'BlockBuilderRegistry',
				)
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						blockBuilderRegistryFactory,
						[ethers.ZeroAddress, tmpAddress],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(
					blockBuilderRegistryFactory,
					'AddressZero',
				)
			})
			it('verifier address should not be zero address', async () => {
				const blockBuilderRegistryFactory = await ethers.getContractFactory(
					'BlockBuilderRegistry',
				)
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						blockBuilderRegistryFactory,
						[tmpAddress, ethers.ZeroAddress],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(
					blockBuilderRegistryFactory,
					'AddressZero',
				)
			})
		})
	})
	describe('updateBlockBuilder', () => {
		describe('success', () => {
			it('should update blockBuilders', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(
					blockBuilderInfoBefore,
					getDefaultBlockBuilderInfo(),
				)

				const stakeAmount = ethers.parseEther('0.3')
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})
			})
			it('should stake the base currency', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const balanceBefore = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				const stakeAmount = ethers.parseEther('0.3')
				const res = await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
				const gasCost = await getGasCost(res)
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				expect(balanceBefore - stakeAmount - gasCost).to.equal(balanceAfter)
			})
			it('should update stakeAmount when the same sender executes updateBlockBuilder', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const balanceBefore = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				const stakeAmount1 = ethers.parseEther('0.3')
				const res1 = await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount1 })
				const gasCost1 = await getGasCost(res1)
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoBefore, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount1,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})

				const stakeAmount2 = ethers.parseEther('0.5')
				const res2 = await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount2 })
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				const gasCost2 = await getGasCost(res2)
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount1 + stakeAmount2,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})
				expect(
					balanceBefore - stakeAmount1 - stakeAmount2 - gasCost1 - gasCost2,
				).to.equal(balanceAfter)
			})
			it('should emit BlockBuilderUpdated event when updateBlockBuilder is executed', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const stakeAmount = ethers.parseEther('0.3')
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.updateBlockBuilder(DUMMY_URL, { value: stakeAmount }),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderUpdated')
					.withArgs(signers.blockBuilder1.address, DUMMY_URL, stakeAmount)
			})
		})
		describe('fail', () => {
			it('should revert with InsufficientStakeAmount when total stake amount is less than MIN_STAKE_AMOUNT', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.updateBlockBuilder(DUMMY_URL),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'InsufficientStakeAmount',
				)
			})
			it('should revert with URLIsEmpty when url is 0 length', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.updateBlockBuilder(''),
				).to.be.revertedWithCustomError(blockBuilderRegistry, 'URLIsEmpty')
			})
		})
	})
	describe('stopBlockBuilder', () => {
		describe('success', () => {
			it('should update block builder information', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const stakeAmount = ethers.parseEther('0.3')
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoBefore, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.stopBlockBuilder()
				const currentTimestamp = await time.latest()
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoAfter, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: currentTimestamp,
					numSlashes: 0n,
					isValid: false,
				})
			})
			it('should emit BlockBuilderStopped event', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const stakeAmount = ethers.parseEther('0.3')
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder1)
						.stopBlockBuilder(),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderStopped')
					.withArgs(signers.blockBuilder1.address)
			})
		})
		describe('fail', () => {
			it('should revert with BlockBuilderNotFound error when not staked', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.notStakedBlockBuilder.address,
				)
				const defaultBlockBuilderInfo = getDefaultBlockBuilderInfo()
				checkBlockBuilderInfo(blockBuilderInfo, defaultBlockBuilderInfo)
				await expect(
					blockBuilderRegistry
						.connect(signers.notStakedBlockBuilder)
						.stopBlockBuilder(),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'BlockBuilderNotFound',
				)
			})
		})
	})
	describe('unstake', () => {
		const unstakeSetup = async (): Promise<[BlockBuilderRegistry, bigint]> => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			const stakeAmount = ethers.parseEther('0.3')
			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.stopBlockBuilder()
			return [blockBuilderRegistry, stakeAmount]
		}
		describe('success', () => {
			it('should delete block builder information', async () => {
				const [blockBuilderRegistry, stakeAmount] =
					await loadFixture(unstakeSetup)
				const signers = await getSigners()

				const currentTimestamp = await time.latest()
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoBefore, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: currentTimestamp,
					numSlashes: 0n,
					isValid: false,
				})
				await time.increase(ONE_DAY_SECONDS)
				await blockBuilderRegistry.connect(signers.blockBuilder1).unstake()
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				checkBlockBuilderInfo(
					blockBuilderInfoAfter,
					getDefaultBlockBuilderInfo(),
				)
			})

			it('should return staked base currency', async () => {
				const [blockBuilderRegistry, stakeAmount] =
					await loadFixture(unstakeSetup)
				const signers = await getSigners()
				await time.increase(ONE_DAY_SECONDS)

				const balanceBefore = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				const res = await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.unstake()
				const gasCost = await getGasCost(res)
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder1.address,
				)
				expect(balanceBefore + stakeAmount - gasCost).to.equal(balanceAfter)
			})

			it('should emit BlockBuilderUpdated event', async () => {
				const [blockBuilderRegistry, stakeAmount] =
					await loadFixture(unstakeSetup)
				const signers = await getSigners()
				await time.increase(ONE_DAY_SECONDS)
				await expect(
					blockBuilderRegistry.connect(signers.blockBuilder1).unstake(),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderUpdated')
					.withArgs(signers.blockBuilder1.address, DUMMY_URL, stakeAmount)
			})
		})
		describe('fail', () => {
			it('should revert with BlockBuilderNotFound error when not staked', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.notStakedBlockBuilder.address,
				)
				const defaultBlockBuilderInfo = getDefaultBlockBuilderInfo()
				checkBlockBuilderInfo(blockBuilderInfo, defaultBlockBuilderInfo)
				await expect(
					blockBuilderRegistry.connect(signers.notStakedBlockBuilder).unstake(),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'BlockBuilderNotFound',
				)
			})
			it('should revert with CannotUnstakeWithinChallengeDuration error when not in challenge period', async () => {
				const [blockBuilderRegistry] = await loadFixture(unstakeSetup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry.connect(signers.blockBuilder1).unstake(),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'CannotUnstakeWithinChallengeDuration',
				)
			})
		})
	})
	describe('submitBlockFraudProof', () => {
		const NEXT_BLOCK_NUMBER = 10
		const NEXT_BLOCK_HASH =
			'0x24929df465c4ddb31d708d5d556904ed0f8db9bb70be37d22213ea4e22028fcd'
		describe('success', () => {
			it('should create BlockFraudProofSubmitted event', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.deployer)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				)
					.to.emit(blockBuilderRegistry, 'BlockFraudProofSubmitted')
					.withArgs(
						fraudProof.blockNumber,
						signers.blockBuilder1.address,
						signers.deployer.address,
					)
			})
			it('should slash builders who have done something wrong', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				const beforeChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				const res = await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const afterBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				expect(
					afterChallengerBalance - beforeChallengerBalance + gasCost,
				).to.equal(MIN_STAKE_AMOUNT / 2n)
				expect(afterBurnBalance - beforeBurnBalance).to.equal(
					MIN_STAKE_AMOUNT / 2n,
				)
			})
			it('should create BlockBuilderSlashed event', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.deployer)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderSlashed')
					.withArgs(signers.blockBuilder1.address, signers.deployer.address)
			})
			it('should update blockBuilders (case 1)', async () => {
				const [blockBuilderRegistry, , , stakeAmount, fraudProof] =
					await loadFixture(slashBlockBuilderSetup)
				const signers = await getSigners()
				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				expect(beforeBlockBuilderInfo.blockBuilderUrl).to.equal(DUMMY_URL)
				expect(beforeBlockBuilderInfo.stakeAmount).to.equal(stakeAmount)
				expect(beforeBlockBuilderInfo.stopTime).to.equal(0)
				expect(beforeBlockBuilderInfo.numSlashes).to.equal(0)
				expect(beforeBlockBuilderInfo.isValid).to.be.true

				await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				const afterBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				expect(afterBlockBuilderInfo.blockBuilderUrl).to.equal(DUMMY_URL)
				expect(afterBlockBuilderInfo.stakeAmount).to.equal(
					stakeAmount - MIN_STAKE_AMOUNT,
				)
				expect(afterBlockBuilderInfo.stopTime).to.equal(0)
				expect(afterBlockBuilderInfo.numSlashes).to.equal(1)
				expect(afterBlockBuilderInfo.isValid).to.be.true
			})
			it('should update blockBuilders (case 2)', async () => {
				const [blockBuilderRegistry, rollup, , stakeAmount, fraudProof] =
					await loadFixture(slashBlockBuilderSetup)
				const signers = await getSigners()
				await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)

				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				expect(beforeBlockBuilderInfo.blockBuilderUrl).to.equal(DUMMY_URL)
				expect(beforeBlockBuilderInfo.stakeAmount).to.equal(
					stakeAmount - MIN_STAKE_AMOUNT,
				)
				expect(beforeBlockBuilderInfo.stopTime).to.equal(0)
				expect(beforeBlockBuilderInfo.numSlashes).to.equal(1)
				expect(beforeBlockBuilderInfo.isValid).to.be.true

				const nextFraudProof = await getTestFraudProofPublicInputs(
					NEXT_BLOCK_HASH,
					ethers.toBigInt(NEXT_BLOCK_NUMBER),
				)
				await rollup.setTestData(
					nextFraudProof.blockNumber,
					nextFraudProof.blockHash,
					signers.blockBuilder1.address,
				)

				await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(nextFraudProof, DUMMY_PROOF)
				const afterBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				expect(afterBlockBuilderInfo.blockBuilderUrl).to.equal(DUMMY_URL)
				expect(afterBlockBuilderInfo.stakeAmount).to.equal(0)
				expect(afterBlockBuilderInfo.stopTime).to.equal(0)
				expect(afterBlockBuilderInfo.numSlashes).to.equal(2)
				expect(afterBlockBuilderInfo.isValid).to.be.false
			})
			it('should only reward the challenger when stake amount is less than half of the minimum stake amount', async () => {
				const [blockBuilderRegistry, rollup, , , fraudProof] =
					await loadFixture(slashBlockBuilderSetup)
				const signers = await getSigners()
				await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)

				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				const stakeAmount = beforeBlockBuilderInfo.stakeAmount
				expect(stakeAmount < MIN_STAKE_AMOUNT / 2n).to.be.true

				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)

				const nextFraudProof = await getTestFraudProofPublicInputs(
					NEXT_BLOCK_HASH,
					ethers.toBigInt(NEXT_BLOCK_NUMBER),
				)
				await rollup.setTestData(
					nextFraudProof.blockNumber,
					nextFraudProof.blockHash,
					signers.blockBuilder1.address,
				)
				const beforeChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const res = await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(nextFraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const afterBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				expect(
					afterChallengerBalance - beforeChallengerBalance + gasCost,
				).to.be.equal(stakeAmount)
				expect(afterBurnBalance - beforeBurnBalance).to.be.equal(0)
			})
			it('should reward both challenger and burn address when stake amount is at least half of the minimum stake amount', async () => {
				const [blockBuilderRegistry, rollup, , , fraudProof] =
					await loadFixture(slashBlockBuilderSetup)
				const signers = await getSigners()
				await blockBuilderRegistry
					.connect(signers.blockBuilder1)
					.updateBlockBuilder(DUMMY_URL, { value: ethers.parseEther('0.05') })
				await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)

				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder1.address,
				)
				const stakeAmount = beforeBlockBuilderInfo.stakeAmount
				expect(stakeAmount >= MIN_STAKE_AMOUNT / 2n).to.be.true
				expect(stakeAmount < MIN_STAKE_AMOUNT).to.be.true

				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)

				const nextFraudProof = await getTestFraudProofPublicInputs(
					NEXT_BLOCK_HASH,
					ethers.toBigInt(NEXT_BLOCK_NUMBER),
				)
				await rollup.setTestData(
					nextFraudProof.blockNumber,
					nextFraudProof.blockHash,
					signers.blockBuilder1.address,
				)
				const beforeChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const res = await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(nextFraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const afterBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				expect(
					afterChallengerBalance - beforeChallengerBalance + gasCost,
				).to.be.equal(MIN_STAKE_AMOUNT / 2n)
				expect(afterBurnBalance - beforeBurnBalance).to.be.equal(
					stakeAmount - MIN_STAKE_AMOUNT / 2n,
				)
			})
		})
		describe('fail', () => {
			it('should revert with FraudProofBlockHashMismatch error when mismatch hash', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				const copy = Object.assign({}, fraudProof)
				const beforeBlockHash = copy.blockHash
				copy.blockHash = ethers.ZeroHash
				await expect(
					blockBuilderRegistry
						.connect(signers.deployer)
						.submitBlockFraudProof(copy, DUMMY_PROOF),
				)
					.to.be.revertedWithCustomError(
						blockBuilderRegistry,
						'FraudProofBlockHashMismatch',
					)
					.withArgs(copy.blockHash, beforeBlockHash)
			})
			it('should revert with FraudProofChallengerMismatch error when mismatch sender', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				const copy = Object.assign({}, fraudProof)
				copy.challenger = signers.user.address

				await expect(
					blockBuilderRegistry
						.connect(signers.deployer)
						.submitBlockFraudProof(copy, DUMMY_PROOF),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'FraudProofChallengerMismatch',
				)
			})
			it('only owner', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.user)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				)
					.to.be.revertedWithCustomError(
						blockBuilderRegistry,
						'OwnableUnauthorizedAccount',
					)
					.withArgs(signers.user.address)
			})

			it('should revert with FraudProofAlreadySubmitted error when Already slash block', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				await expect(
					blockBuilderRegistry
						.connect(signers.deployer)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'FraudProofAlreadySubmitted',
				)
			})
			it('should revert with FraudProofVerificationFailed error when return false by verify', async () => {
				const [blockBuilderRegistry, , verifier, , fraudProof] =
					await loadFixture(slashBlockBuilderSetup)
				const signers = await getSigners()
				await verifier.setResult(false)
				await expect(
					blockBuilderRegistry
						.connect(signers.deployer)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'FraudProofVerificationFailed',
				)
			})

			it('should revert with BlockBuilderNotFound error when not staked', async () => {
				const [blockBuilderRegistry, rollup] = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.notStakedBlockBuilder.address,
				)
				expect(blockBuilderInfo.stakeAmount).to.equal(0)

				const fraudProof = await getTestFraudProofPublicInputs(
					DUMMY_BLOCK_HASH,
					DUMMY_BLOCK_NUMBER,
				)
				await rollup.setTestData(
					fraudProof.blockNumber,
					fraudProof.blockHash,
					signers.blockBuilder1.address,
				)

				await expect(
					blockBuilderRegistry
						.connect(signers.deployer)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'BlockBuilderNotFound',
				)
			})
		})
	})
	describe('setBurnAddress', () => {
		describe('success', () => {
			it('should be able to change the burn address', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				const nextBurnAddress = ethers.Wallet.createRandom().address

				await blockBuilderRegistry.setBurnAddress(nextBurnAddress)

				const beforeChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				const beforeNextBurnBalance =
					await ethers.provider.getBalance(nextBurnAddress)

				const res = await blockBuilderRegistry
					.connect(signers.deployer)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.deployer.address,
				)
				const afterBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				const afterNextBurnBalance =
					await ethers.provider.getBalance(nextBurnAddress)
				expect(
					afterChallengerBalance - beforeChallengerBalance + gasCost,
				).to.equal(MIN_STAKE_AMOUNT / 2n)
				expect(afterNextBurnBalance - beforeNextBurnBalance).to.equal(
					MIN_STAKE_AMOUNT / 2n,
				)
				expect(afterBurnBalance).to.equal(0)
				expect(beforeBurnBalance).to.equal(0)
			})
		})
		describe('fail', () => {
			it('should only be callable by owner', async () => {
				const [blockBuilderRegistry] = await loadFixture(slashBlockBuilderSetup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.user)
						.setBurnAddress(ethers.ZeroAddress),
				)
					.to.be.revertedWithCustomError(
						blockBuilderRegistry,
						'OwnableUnauthorizedAccount',
					)
					.withArgs(signers.user.address)
			})
		})
	})
	describe('isValidBlockBuilder', () => {
		it('should return false when not valid', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			const result = await blockBuilderRegistry.isValidBlockBuilder(
				signers.notStakedBlockBuilder.address,
			)
			expect(result).to.be.false
		})
		it('should return true when valid', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			const stakeAmount = ethers.parseEther('0.3')
			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
			const result = await blockBuilderRegistry.isValidBlockBuilder(
				signers.blockBuilder1.address,
			)
			expect(result).to.be.true
		})
	})

	describe('getValidBlockBuilders', () => {
		it('get block builder info', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const { blockBuilder1, blockBuilder2, blockBuilder3 } = await getSigners()

			await blockBuilderRegistry
				.connect(blockBuilder1)
				.updateBlockBuilder(DUMMY_URL + '1', {
					value: ethers.parseEther('0.3'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder2)
				.updateBlockBuilder(DUMMY_URL + '2', {
					value: ethers.parseEther('0.2'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder3)
				.updateBlockBuilder(DUMMY_URL + '3', {
					value: ethers.parseEther('0.1'),
				})
			const builders = await blockBuilderRegistry.getValidBlockBuilders()
			expect(builders.length).to.equal(3)
			expect(builders[0].blockBuilderAddress).to.equal(blockBuilder1)
			expect(builders[0].info.blockBuilderUrl).to.equal(DUMMY_URL + '1')
			expect(builders[0].info.stakeAmount).to.equal(ethers.parseEther('0.3'))
			expect(builders[0].info.stopTime).to.equal(0)
			expect(builders[0].info.numSlashes).to.equal(0)
			expect(builders[0].info.isValid).to.equal(true)

			expect(builders[1].blockBuilderAddress).to.equal(blockBuilder2)
			expect(builders[1].info.blockBuilderUrl).to.equal(DUMMY_URL + '2')
			expect(builders[1].info.stakeAmount).to.equal(ethers.parseEther('0.2'))
			expect(builders[1].info.stopTime).to.equal(0)
			expect(builders[1].info.numSlashes).to.equal(0)
			expect(builders[1].info.isValid).to.equal(true)

			expect(builders[2].blockBuilderAddress).to.equal(blockBuilder3)
			expect(builders[2].info.blockBuilderUrl).to.equal(DUMMY_URL + '3')
			expect(builders[2].info.stakeAmount).to.equal(ethers.parseEther('0.1'))
			expect(builders[2].info.stopTime).to.equal(0)
			expect(builders[2].info.numSlashes).to.equal(0)
			expect(builders[2].info.isValid).to.equal(true)
		})

		it('only valid block info', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const { blockBuilder1, blockBuilder2, blockBuilder3 } = await getSigners()

			await blockBuilderRegistry
				.connect(blockBuilder1)
				.updateBlockBuilder(DUMMY_URL + '1', {
					value: ethers.parseEther('0.3'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder2)
				.updateBlockBuilder(DUMMY_URL + '2', {
					value: ethers.parseEther('0.2'),
				})
			await blockBuilderRegistry
				.connect(blockBuilder3)
				.updateBlockBuilder(DUMMY_URL + '3', {
					value: ethers.parseEther('0.1'),
				})

			await blockBuilderRegistry.connect(blockBuilder2).stopBlockBuilder()

			const builders = await blockBuilderRegistry.getValidBlockBuilders()
			expect(builders.length).to.equal(2)
			expect(builders[0].blockBuilderAddress).to.equal(blockBuilder1)
			expect(builders[0].info.blockBuilderUrl).to.equal(DUMMY_URL + '1')
			expect(builders[0].info.stakeAmount).to.equal(ethers.parseEther('0.3'))
			expect(builders[0].info.stopTime).to.equal(0)
			expect(builders[0].info.numSlashes).to.equal(0)
			expect(builders[0].info.isValid).to.equal(true)

			expect(builders[1].blockBuilderAddress).to.equal(blockBuilder3)
			expect(builders[1].info.blockBuilderUrl).to.equal(DUMMY_URL + '3')
			expect(builders[1].info.stakeAmount).to.equal(ethers.parseEther('0.1'))
			expect(builders[1].info.stopTime).to.equal(0)
			expect(builders[1].info.numSlashes).to.equal(0)
			expect(builders[1].info.isValid).to.equal(true)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()

			const stakeAmount = ethers.parseEther('0.3')
			await blockBuilderRegistry
				.connect(signers.blockBuilder1)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

			const registry2Factory = await ethers.getContractFactory(
				'BlockBuilderRegistry2Test',
			)
			const next = await upgrades.upgradeProxy(
				await blockBuilderRegistry.getAddress(),
				registry2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const blockBuilderInfo = await blockBuilderRegistry.blockBuilders(
				signers.blockBuilder1.address,
			)
			expect(blockBuilderInfo.blockBuilderUrl).to.equal(DUMMY_URL)
			const val = await next.getVal()
			expect(val).to.equal(1)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			const registryFactory = await ethers.getContractFactory(
				'BlockBuilderRegistry2Test',
				signers.user,
			)
			await expect(
				upgrades.upgradeProxy(
					await blockBuilderRegistry.getAddress(),
					registryFactory,
					{ unsafeAllow: ['constructor'] },
				),
			)
				.to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'OwnableUnauthorizedAccount',
				)
				.withArgs(signers.user.address)
		})
	})
	describe('reentrancy', () => {
		it.skip('unstake', async () => {
			// payable(recipient).transfer(amount);
			// The gas consumption is limited to 2500 because the transfer function is performed.
			// Therefore, reentrancy attacks that execute complex logic are not possible.
		})
		it.skip('slashBlockBuilder', async () => {
			// payable(recipient).transfer(amount);
			// The gas consumption is limited to 2500 because the transfer function is performed.
			// Therefore, reentrancy attacks that execute complex logic are not possible.
		})
	})
})
