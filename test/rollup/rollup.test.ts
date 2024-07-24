import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { ContractTransactionResponse } from 'ethers'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import {
	Rollup,
	BlockBuilderRegistryTestForRollup
} from '../../typechain-types'

describe('Rollup', () => {
	////////////////////////////////////////////////////////////////////////
	const setup = async (): Promise<[Rollup, BlockBuilderRegistryTestForRollup]> => {
		const blockBuilderRegistryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistryTestForRollup',
		)
		const blockBuilderRegistry = (await blockBuilderRegistryFactory.deploy()) as BlockBuilderRegistryTestForRollup
		const rollupFactory = await ethers.getContractFactory(
			'Rollup',
		)
		const signers = await getSigners()
		const rollup = (await upgrades.deployProxy(
			rollupFactory,
			[signers.l2ScrollMessenger.address, signers.liquidity.address, await blockBuilderRegistry.getAddress()],
			{ kind: 'uups' },
		)) as unknown as Rollup
		return [rollup, blockBuilderRegistry]
	}

	type signers = {
		deployer: HardhatEthersSigner
		l2ScrollMessenger: HardhatEthersSigner
		liquidity: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, l2ScrollMessenger, liquidity] =
			await ethers.getSigners()
		return {
			deployer,
			l2ScrollMessenger,
			liquidity
		}
	}

	describe('initialize', () => {
		describe('success', () => {
			it('deployerがオーナーに設定されている', async () => {
				const [rollup] = await loadFixture(setup)
	
				
			})
		})
		describe('fail', () => {

		})

		it('should set the deployer as the owner', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()
			expect(await blockBuilderRegistry.owner()).to.equal(
				signers.deployer.address,
			)
		})
	})
	describe('updateBlockBuilder', () => {
		describe('success', () => {
			it('should update blockBuilders', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
				)
				checkBlockBuilderInfo(
					blockBuilderInfoBefore,
					getDefaultBlockBuilderInfo(),
				)

				const stakeAmount = ethers.parseEther('0.3')
				await blockBuilderRegistry
					.connect(signers.blockBuilder)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
					signers.blockBuilder.address,
				)
				const stakeAmount = ethers.parseEther('0.3')
				const res = await blockBuilderRegistry
					.connect(signers.blockBuilder)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
				const gasCost = await getGasCost(res)
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder.address,
				)
				expect(balanceBefore - stakeAmount - gasCost).to.equal(balanceAfter)
			})
			it('should update stakeAmount when the same sender executes updateBlockBuilder', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				const balanceBefore = await ethers.provider.getBalance(
					signers.blockBuilder.address,
				)
				const stakeAmount1 = ethers.parseEther('0.3')
				const res1 = await blockBuilderRegistry
					.connect(signers.blockBuilder)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount1 })
				const gasCost1 = await getGasCost(res1)
				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
					.connect(signers.blockBuilder)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount2 })
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder.address,
				)
				const gasCost2 = await getGasCost(res2)
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
						.connect(signers.blockBuilder)
						.updateBlockBuilder(DUMMY_URL, { value: stakeAmount }),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderUpdated')
					.withArgs(signers.blockBuilder.address, DUMMY_URL, stakeAmount)
			})
		})
		describe('fail', () => {
			it('should revert with InsufficientStakeAmount when total stake amount is less than MIN_STAKE_AMOUNT', async () => {
				const [blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await expect(
					blockBuilderRegistry
						.connect(signers.blockBuilder)
						.updateBlockBuilder(DUMMY_URL),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'InsufficientStakeAmount',
				)
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
					.connect(signers.blockBuilder)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

				const blockBuilderInfoBefore = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoBefore, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: 0n,
					numSlashes: 0n,
					isValid: true,
				})
				await blockBuilderRegistry
					.connect(signers.blockBuilder)
					.stopBlockBuilder()
				const currentTimestamp = await time.latest()
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
					.connect(signers.blockBuilder)
					.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

				await expect(
					blockBuilderRegistry.connect(signers.blockBuilder).stopBlockBuilder(),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderStopped')
					.withArgs(signers.blockBuilder.address)
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
				.connect(signers.blockBuilder)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

			await blockBuilderRegistry
				.connect(signers.blockBuilder)
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
					signers.blockBuilder.address,
				)
				checkBlockBuilderInfo(blockBuilderInfoBefore, {
					blockBuilderUrl: DUMMY_URL,
					stakeAmount: stakeAmount,
					stopTime: currentTimestamp,
					numSlashes: 0n,
					isValid: false,
				})
				await time.increase(ONE_DAY_SECONDS)
				await blockBuilderRegistry.connect(signers.blockBuilder).unstake()
				const blockBuilderInfoAfter = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
					signers.blockBuilder.address,
				)
				const res = await blockBuilderRegistry
					.connect(signers.blockBuilder)
					.unstake()
				const gasCost = await getGasCost(res)
				const balanceAfter = await ethers.provider.getBalance(
					signers.blockBuilder.address,
				)
				expect(balanceBefore + stakeAmount - gasCost).to.equal(balanceAfter)
			})

			it('should emit BlockBuilderUpdated event', async () => {
				const [blockBuilderRegistry, stakeAmount] =
					await loadFixture(unstakeSetup)
				const signers = await getSigners()
				await time.increase(ONE_DAY_SECONDS)
				await expect(
					blockBuilderRegistry.connect(signers.blockBuilder).unstake(),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderUpdated')
					.withArgs(signers.blockBuilder.address, DUMMY_URL, stakeAmount)
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
					blockBuilderRegistry.connect(signers.blockBuilder).unstake(),
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
						.connect(signers.challenger)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				)
					.to.emit(blockBuilderRegistry, 'BlockFraudProofSubmitted')
					.withArgs(
						fraudProof.blockNumber,
						signers.blockBuilder.address,
						signers.challenger.address,
					)
			})
			it('should slash builders who have done something wrong', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				const beforeChallengerBalance = await ethers.provider.getBalance(
					signers.challenger.address,
				)
				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				const res = await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.challenger.address,
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
						.connect(signers.challenger)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				)
					.to.emit(blockBuilderRegistry, 'BlockBuilderSlashed')
					.withArgs(signers.blockBuilder.address, signers.challenger.address)
			})
			it('should update blockBuilders (case 1)', async () => {
				const [blockBuilderRegistry, , , stakeAmount, fraudProof] =
					await loadFixture(slashBlockBuilderSetup)
				const signers = await getSigners()
				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
				)
				expect(beforeBlockBuilderInfo.blockBuilderUrl).to.equal(DUMMY_URL)
				expect(beforeBlockBuilderInfo.stakeAmount).to.equal(stakeAmount)
				expect(beforeBlockBuilderInfo.stopTime).to.equal(0)
				expect(beforeBlockBuilderInfo.numSlashes).to.equal(0)
				expect(beforeBlockBuilderInfo.isValid).to.be.true

				await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				const afterBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
					.connect(signers.challenger)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)

				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
					signers.blockBuilder.address,
				)

				await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(nextFraudProof, DUMMY_PROOF)
				const afterBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
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
					.connect(signers.challenger)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)

				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
				)
				const stakeAmount = beforeBlockBuilderInfo.stakeAmount
				expect(stakeAmount < MIN_STAKE_AMOUNT / 2n).to.be.true

				const beforeChallengerBalance = await ethers.provider.getBalance(
					signers.challenger.address,
				)
				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)

				const nextFraudProof = await getTestFraudProofPublicInputs(
					NEXT_BLOCK_HASH,
					ethers.toBigInt(NEXT_BLOCK_NUMBER),
				)
				await rollup.setTestData(
					nextFraudProof.blockNumber,
					nextFraudProof.blockHash,
					signers.blockBuilder.address,
				)

				const res = await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(nextFraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.challenger.address,
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
					.connect(signers.blockBuilder)
					.updateBlockBuilder(DUMMY_URL, { value: ethers.parseEther('0.05') })
				await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)

				const beforeBlockBuilderInfo = await blockBuilderRegistry.blockBuilders(
					signers.blockBuilder.address,
				)
				const stakeAmount = beforeBlockBuilderInfo.stakeAmount
				expect(stakeAmount >= MIN_STAKE_AMOUNT / 2n).to.be.true
				expect(stakeAmount < MIN_STAKE_AMOUNT).to.be.true

				const beforeChallengerBalance = await ethers.provider.getBalance(
					signers.challenger.address,
				)
				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)

				const nextFraudProof = await getTestFraudProofPublicInputs(
					NEXT_BLOCK_HASH,
					ethers.toBigInt(NEXT_BLOCK_NUMBER),
				)
				await rollup.setTestData(
					nextFraudProof.blockNumber,
					nextFraudProof.blockHash,
					signers.blockBuilder.address,
				)

				const res = await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(nextFraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.challenger.address,
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
						.connect(signers.challenger)
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

				await expect(
					blockBuilderRegistry
						.connect(signers.user)
						.submitBlockFraudProof(fraudProof, DUMMY_PROOF),
				).to.be.revertedWithCustomError(
					blockBuilderRegistry,
					'FraudProofChallengerMismatch',
				)
			})

			it('should revert with FraudProofAlreadySubmitted error when Already slash block', async () => {
				const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
					slashBlockBuilderSetup,
				)
				const signers = await getSigners()
				await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				await expect(
					blockBuilderRegistry
						.connect(signers.challenger)
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
						.connect(signers.challenger)
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
					signers.blockBuilder.address,
				)

				await expect(
					blockBuilderRegistry
						.connect(signers.challenger)
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
					signers.challenger.address,
				)
				const beforeBurnBalance =
					await ethers.provider.getBalance(DEFAULT_BURN_ADDRESS)
				const beforeNextBurnBalance =
					await ethers.provider.getBalance(nextBurnAddress)

				const res = await blockBuilderRegistry
					.connect(signers.challenger)
					.submitBlockFraudProof(fraudProof, DUMMY_PROOF)
				const gasCost = await getGasCost(res)
				const afterChallengerBalance = await ethers.provider.getBalance(
					signers.challenger.address,
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
				.connect(signers.blockBuilder)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })
			const result = await blockBuilderRegistry.isValidBlockBuilder(
				signers.blockBuilder.address,
			)
			expect(result).to.be.true
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const signers = await getSigners()

			const stakeAmount = ethers.parseEther('0.3')
			await blockBuilderRegistry
				.connect(signers.blockBuilder)
				.updateBlockBuilder(DUMMY_URL, { value: stakeAmount })

			const registry2Factory = await ethers.getContractFactory(
				'BlockBuilderRegistry2Test',
			)
			const next = await upgrades.upgradeProxy(
				await blockBuilderRegistry.getAddress(),
				registry2Factory,
			)
			const blockBuilderInfo = await blockBuilderRegistry.blockBuilders(
				signers.blockBuilder.address,
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
		it('unstake', async () => {
			const [blockBuilderRegistry] = await loadFixture(setup)
			const reentrancyFactory = await ethers.getContractFactory(
				'UnstakeReentrancyTest',
			)
			const reentrancy = (await reentrancyFactory.deploy(
				await blockBuilderRegistry.getAddress(),
			)) as unknown as UnstakeReentrancyTest
			const stakeAmount = ethers.parseEther('0.3')
			await reentrancy.updateBlockBuilder({ value: stakeAmount })
			await reentrancy.stopBlockBuilder()
			await time.increase(ONE_DAY_SECONDS)

			await expect(reentrancy.unstake())
				.to.be.revertedWithCustomError(blockBuilderRegistry, 'FailedTransfer')
				.withArgs(await reentrancy.getAddress(), stakeAmount)
		})
		it('slashBlockBuilder', async () => {
			const [blockBuilderRegistry, , , , fraudProof] = await loadFixture(
				slashBlockBuilderSetup,
			)
			const signers = await getSigners()
			const reentrancyTestFactory = await ethers.getContractFactory(
				'SubmitBlockFraudProofReentrancyTest',
			)
			const reentrancy = (await reentrancyTestFactory.deploy(
				await blockBuilderRegistry.getAddress(),
			)) as unknown as SubmitBlockFraudProofReentrancyTest
			fraudProof.challenger = await reentrancy.getAddress()
			await expect(reentrancy.submitBlockFraudProof(fraudProof, DUMMY_PROOF))
				.to.be.revertedWithCustomError(blockBuilderRegistry, 'FailedTransfer')
				.withArgs(await reentrancy.getAddress(), MIN_STAKE_AMOUNT / 2n)
		})
	})
})
