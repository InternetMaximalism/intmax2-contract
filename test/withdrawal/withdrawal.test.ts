import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import {
	Withdrawal,
	L2ScrollMessengerTestForWithdrawal,
	MockPlonkVerifier,
	RollupTestForWithdrawal,
	ContributionTest,
} from '../../typechain-types'
import {
	getPrevHashFromWithdrawals,
	getChainedWithdrawals,
} from './common.test'

describe('Withdrawal', () => {
	const DIRECT_WITHDRAWAL_TOKEN_INDICES = [1, 2, 3]
	const UINT256_MAX =
		'115792089237316195423570985008687907853269984665640564039457584007913129639935'
	async function setup(): Promise<
		[
			Withdrawal,
			L2ScrollMessengerTestForWithdrawal,
			MockPlonkVerifier,
			RollupTestForWithdrawal,
			string,
			ContributionTest,
		]
	> {
		const l2ScrollMessengerFactory = await ethers.getContractFactory(
			'L2ScrollMessengerTestForWithdrawal',
		)
		const l2ScrollMessenger = await l2ScrollMessengerFactory.deploy()
		const mockPlonkVerifierFactory =
			await ethers.getContractFactory('MockPlonkVerifier')
		const mockPlonkVerifier = await mockPlonkVerifierFactory.deploy()
		const rollupTestForWithdrawalFactory = await ethers.getContractFactory(
			'RollupTestForWithdrawal',
		)
		const rollupTestForWithdrawal =
			await rollupTestForWithdrawalFactory.deploy()
		const liquidity = ethers.Wallet.createRandom().address
		const contributionTestFactory =
			await ethers.getContractFactory('ContributionTest')
		const contribution =
			(await contributionTestFactory.deploy()) as ContributionTest
		const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
		const withdrawal = (await upgrades.deployProxy(
			withdrawalFactory,
			[
				await l2ScrollMessenger.getAddress(),
				await mockPlonkVerifier.getAddress(),
				liquidity,
				await rollupTestForWithdrawal.getAddress(),
				await contribution.getAddress(),
				DIRECT_WITHDRAWAL_TOKEN_INDICES,
			],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as Withdrawal
		return [
			withdrawal,
			l2ScrollMessenger,
			mockPlonkVerifier,
			rollupTestForWithdrawal,
			liquidity,
			contribution,
		]
	}
	type signers = {
		deployer: HardhatEthersSigner
		user: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, user] = await ethers.getSigners()
		return {
			deployer,
			user,
		}
	}
	describe('initialize', () => {
		describe('success', () => {
			it('should set deployer as the owner', async () => {
				const [withdrawal] = await loadFixture(setup)
				const signers = await getSigners()
				expect(await withdrawal.owner()).to.equal(signers.deployer.address)
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const [withdrawal] = await loadFixture(setup)
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					withdrawal.initialize(
						tmpAddress,
						tmpAddress,
						tmpAddress,
						tmpAddress,
						tmpAddress,
						[0, 1],
					),
				).to.be.revertedWithCustomError(withdrawal, 'InvalidInitialization')
			})
			it('scrollMessenger is zero address', async () => {
				const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						withdrawalFactory,
						[
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							DIRECT_WITHDRAWAL_TOKEN_INDICES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(withdrawalFactory, 'AddressZero')
			})
			it('withdrawalVerifier is zero address', async () => {
				const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						withdrawalFactory,
						[
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							DIRECT_WITHDRAWAL_TOKEN_INDICES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(withdrawalFactory, 'AddressZero')
			})
			it('liquidity is zero address', async () => {
				const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						withdrawalFactory,
						[
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							DIRECT_WITHDRAWAL_TOKEN_INDICES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(withdrawalFactory, 'AddressZero')
			})
			it('rollup is zero address', async () => {
				const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						withdrawalFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							DIRECT_WITHDRAWAL_TOKEN_INDICES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(withdrawalFactory, 'AddressZero')
			})
			it('contribution is zero address', async () => {
				const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						withdrawalFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							DIRECT_WITHDRAWAL_TOKEN_INDICES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(withdrawalFactory, 'AddressZero')
			})

			it('token index is already exist', async () => {
				const withdrawalFactory =
					await ethers.getContractFactory('Withdrawal2Test')
				const withdrawal = await withdrawalFactory.deploy()
				const { deployer } = await getSigners()
				const tmpAddress = ethers.Wallet.createRandom().address
				await withdrawal.addOwner(deployer.address)
				await withdrawal.addDirectWithdrawalTokenIndices([1])
				await expect(
					withdrawal.initialize(
						tmpAddress,
						tmpAddress,
						tmpAddress,
						tmpAddress,
						tmpAddress,
						[1],
					),
				)
					.to.be.revertedWithCustomError(withdrawalFactory, 'TokenAlreadyExist')
					.withArgs(1)
			})
		})
	})
	describe('submitWithdrawalProof', () => {
		describe('success', () => {
			it('should accept valid withdrawal proof and queue direct withdrawals', async () => {
				const [
					withdrawal,
					scrollMessenger,
					mockPlonkVerifier,
					rollupTestForWithdrawal,
					liquidity,
				] = await loadFixture(setup)
				const { deployer } = await getSigners()

				// Create withdrawals for direct withdrawal tokens
				const directWithdrawals = getChainedWithdrawals(2).map((w) => ({
					...w,
					tokenIndex: DIRECT_WITHDRAWAL_TOKEN_INDICES[0], // Use a direct withdrawal token index
				}))
				const lastWithdrawalHash = getPrevHashFromWithdrawals(directWithdrawals)

				const validPublicInputs = {
					lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				// Set up mock responses
				await mockPlonkVerifier.setResult(true)
				for (const w of directWithdrawals) {
					await rollupTestForWithdrawal.setTestData(w.blockNumber, w.blockHash)
				}

				// Submit the withdrawal proof
				await expect(
					withdrawal.submitWithdrawalProof(
						directWithdrawals,
						validPublicInputs,
						'0x',
					),
				)
					.to.emit(withdrawal, 'DirectWithdrawalQueued')
					.withArgs(1, directWithdrawals[0].recipient, [
						directWithdrawals[0].recipient,
						directWithdrawals[0].tokenIndex,
						directWithdrawals[0].amount,
						1,
					])
					.and.to.emit(withdrawal, 'DirectWithdrawalQueued')
					.withArgs(2, directWithdrawals[1].recipient, [
						directWithdrawals[1].recipient,
						directWithdrawals[1].tokenIndex,
						directWithdrawals[1].amount,
						2,
					])
					.and.to.emit(withdrawal, 'WithdrawalsQueued')
					.withArgs(2, 0)

				// Verify that the withdrawals were queued
				expect(await withdrawal.lastDirectWithdrawalId()).to.equal(2)
				expect(await withdrawal.lastClaimableWithdrawalId()).to.equal(0)

				expect(await scrollMessenger.to()).to.equal(liquidity)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.message()).to.not.equal('0x')
				expect(await scrollMessenger.gasLimit()).to.equal(UINT256_MAX)
				expect(await scrollMessenger.sender()).to.equal(deployer.address)
				expect(await scrollMessenger.msgValue()).to.equal(0)
			})
			it('should accept valid withdrawal proof and queue claimable withdrawals', async () => {
				const [
					withdrawal,
					scrollMessenger,
					mockPlonkVerifier,
					rollupTestForWithdrawal,
					liquidity,
				] = await loadFixture(setup)
				const { deployer } = await getSigners()

				// Create withdrawals for non-direct withdrawal tokens
				const claimableWithdrawals = getChainedWithdrawals(2).map((w) => ({
					...w,
					tokenIndex: 1000, // Use a non-direct withdrawal token index
				}))
				const lastWithdrawalHash =
					getPrevHashFromWithdrawals(claimableWithdrawals)

				const validPublicInputs = {
					lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				// Set up mock responses
				await mockPlonkVerifier.setResult(true)
				for (const w of claimableWithdrawals) {
					await rollupTestForWithdrawal.setTestData(w.blockNumber, w.blockHash)
				}

				// Submit the withdrawal proof
				await expect(
					withdrawal.submitWithdrawalProof(
						claimableWithdrawals,
						validPublicInputs,
						'0x',
					),
				)
					.to.emit(withdrawal, 'ClaimableWithdrawalQueued')
					.withArgs(1, claimableWithdrawals[0].recipient, [
						claimableWithdrawals[0].recipient,
						claimableWithdrawals[0].tokenIndex,
						claimableWithdrawals[0].amount,
						1,
					])
					.and.to.emit(withdrawal, 'ClaimableWithdrawalQueued')
					.withArgs(2, claimableWithdrawals[1].recipient, [
						claimableWithdrawals[1].recipient,
						claimableWithdrawals[1].tokenIndex,
						claimableWithdrawals[1].amount,
						2,
					])
					.and.to.emit(withdrawal, 'WithdrawalsQueued')
					.withArgs(0, 2)

				// Verify that the withdrawals were queued
				expect(await withdrawal.lastDirectWithdrawalId()).to.equal(0)
				expect(await withdrawal.lastClaimableWithdrawalId()).to.equal(2)

				expect(await scrollMessenger.to()).to.equal(liquidity)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.message()).to.not.equal('0x')
				expect(await scrollMessenger.gasLimit()).to.equal(UINT256_MAX)
				expect(await scrollMessenger.sender()).to.equal(deployer.address)
				expect(await scrollMessenger.msgValue()).to.equal(0)
			})
			it('should handle mixed direct and claimable withdrawals', async () => {
				const [
					withdrawal,
					scrollMessenger,
					mockPlonkVerifier,
					rollupTestForWithdrawal,
					liquidity,
				] = await loadFixture(setup)
				const { deployer } = await getSigners()

				const mixedWithdrawals = [
					{
						...getChainedWithdrawals(1)[0],
						tokenIndex: DIRECT_WITHDRAWAL_TOKEN_INDICES[0],
						blockNumber: 1000,
					},
					{
						...getChainedWithdrawals(1)[0],
						tokenIndex: 1000,
						blockNumber: 2000,
					},
				]
				const lastWithdrawalHash = getPrevHashFromWithdrawals(mixedWithdrawals)

				const validPublicInputs = {
					lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				await mockPlonkVerifier.setResult(true)

				for (const w of mixedWithdrawals) {
					await rollupTestForWithdrawal.setTestData(w.blockNumber, w.blockHash)
				}

				await expect(
					withdrawal.submitWithdrawalProof(
						mixedWithdrawals,
						validPublicInputs,
						'0x',
					),
				)
					.to.emit(withdrawal, 'DirectWithdrawalQueued')
					.and.to.emit(withdrawal, 'ClaimableWithdrawalQueued')
					.and.to.emit(withdrawal, 'WithdrawalsQueued')
					.withArgs(1, 1)
				expect(await withdrawal.lastDirectWithdrawalId()).to.equal(1)
				expect(await withdrawal.lastClaimableWithdrawalId()).to.equal(1)

				expect(await scrollMessenger.to()).to.equal(liquidity)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.message()).to.not.equal('0x')
				expect(await scrollMessenger.gasLimit()).to.equal(UINT256_MAX)
				expect(await scrollMessenger.sender()).to.equal(deployer.address)
				expect(await scrollMessenger.msgValue()).to.equal(0)
			})
			it('should emit DirectWithdrawalQueued event for direct withdrawals', async () => {
				const [
					withdrawal,
					scrollMessenger,
					mockPlonkVerifier,
					rollupTestForWithdrawal,
					liquidity,
				] = await loadFixture(setup)
				const { deployer } = await getSigners()

				const directWithdrawal = {
					...getChainedWithdrawals(1)[0],
					tokenIndex: DIRECT_WITHDRAWAL_TOKEN_INDICES[0],
				}
				const lastWithdrawalHash = getPrevHashFromWithdrawals([
					directWithdrawal,
				])

				const validPublicInputs = {
					lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				await mockPlonkVerifier.setResult(true)
				await rollupTestForWithdrawal.setTestData(
					directWithdrawal.blockNumber,
					directWithdrawal.blockHash,
				)

				await expect(
					withdrawal.submitWithdrawalProof(
						[directWithdrawal],
						validPublicInputs,
						'0x',
					),
				)
					.to.emit(withdrawal, 'DirectWithdrawalQueued')
					.withArgs(1, directWithdrawal.recipient, [
						directWithdrawal.recipient,
						directWithdrawal.tokenIndex,
						directWithdrawal.amount,
						1,
					])
					.and.to.emit(withdrawal, 'WithdrawalsQueued')
					.withArgs(1, 0)
				expect(await scrollMessenger.to()).to.equal(liquidity)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.message()).to.not.equal('0x')
				expect(await scrollMessenger.gasLimit()).to.equal(UINT256_MAX)
				expect(await scrollMessenger.sender()).to.equal(deployer.address)
				expect(await scrollMessenger.msgValue()).to.equal(0)
			})
			it('should emit ClaimableWithdrawalQueued event for claimable withdrawals', async () => {
				const [
					withdrawal,
					scrollMessenger,
					mockPlonkVerifier,
					rollupTestForWithdrawal,
					liquidity,
				] = await loadFixture(setup)
				const { deployer } = await getSigners()

				const claimableWithdrawal = {
					...getChainedWithdrawals(1)[0],
					tokenIndex: 1000,
				}
				const lastWithdrawalHash = getPrevHashFromWithdrawals([
					claimableWithdrawal,
				])

				const validPublicInputs = {
					lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				await mockPlonkVerifier.setResult(true)
				await rollupTestForWithdrawal.setTestData(
					claimableWithdrawal.blockNumber,
					claimableWithdrawal.blockHash,
				)

				await expect(
					withdrawal.submitWithdrawalProof(
						[claimableWithdrawal],
						validPublicInputs,
						'0x',
					),
				)
					.to.emit(withdrawal, 'ClaimableWithdrawalQueued')
					.withArgs(1, claimableWithdrawal.recipient, [
						claimableWithdrawal.recipient,
						claimableWithdrawal.tokenIndex,
						claimableWithdrawal.amount,
						1,
					])
					.and.to.emit(withdrawal, 'WithdrawalsQueued')
					.withArgs(0, 1)
				expect(await scrollMessenger.to()).to.equal(liquidity)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.message()).to.not.equal('0x')
				expect(await scrollMessenger.gasLimit()).to.equal(UINT256_MAX)
				expect(await scrollMessenger.sender()).to.equal(deployer.address)
				expect(await scrollMessenger.msgValue()).to.equal(0)
			})
			it('should not requeue already processed withdrawals (nullifier check)', async () => {
				const [
					withdrawal,
					scrollMessenger,
					mockPlonkVerifier,
					rollupTestForWithdrawal,
				] = await loadFixture(setup)
				const { deployer } = await getSigners()

				const singleWithdrawal = getChainedWithdrawals(1)[0]
				const lastWithdrawalHash = getPrevHashFromWithdrawals([
					singleWithdrawal,
				])

				const validPublicInputs = {
					lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				await mockPlonkVerifier.setResult(true)
				await rollupTestForWithdrawal.setTestData(
					singleWithdrawal.blockNumber,
					singleWithdrawal.blockHash,
				)

				// First submission
				await withdrawal.submitWithdrawalProof(
					[singleWithdrawal],
					validPublicInputs,
					'0x',
				)

				await scrollMessenger.clear()

				// Second submission with the same withdrawal
				await expect(
					withdrawal.submitWithdrawalProof(
						[singleWithdrawal],
						validPublicInputs,
						'0x',
					),
				)
					.to.not.emit(withdrawal, 'WithdrawalsQueued')
					.to.not.emit(withdrawal, 'DirectWithdrawalQueued')
					.and.to.not.emit(withdrawal, 'ClaimableWithdrawalQueued')

				// Check that the withdrawal IDs haven't changed
				expect(await withdrawal.lastDirectWithdrawalId()).to.equal(
					singleWithdrawal.tokenIndex === DIRECT_WITHDRAWAL_TOKEN_INDICES[0]
						? 1
						: 0,
				)
				expect(await withdrawal.lastClaimableWithdrawalId()).to.equal(
					singleWithdrawal.tokenIndex === DIRECT_WITHDRAWAL_TOKEN_INDICES[0]
						? 0
						: 1,
				)

				expect(await scrollMessenger.to()).to.equal(ethers.ZeroAddress)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.message()).to.equal('0x')
				expect(await scrollMessenger.gasLimit()).to.equal(0)
				expect(await scrollMessenger.sender()).to.equal(ethers.ZeroAddress)
				expect(await scrollMessenger.msgValue()).to.equal(0)
			})

			it('call contribution', async () => {
				const [
					withdrawal,
					,
					mockPlonkVerifier,
					rollupTestForWithdrawal,
					,
					contribution,
				] = await loadFixture(setup)
				const { deployer } = await getSigners()

				// Create withdrawals for direct withdrawal tokens
				const directWithdrawals = getChainedWithdrawals(2).map((w) => ({
					...w,
					tokenIndex: DIRECT_WITHDRAWAL_TOKEN_INDICES[0], // Use a direct withdrawal token index
				}))
				const lastWithdrawalHash = getPrevHashFromWithdrawals(directWithdrawals)

				const validPublicInputs = {
					lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				// Set up mock responses
				await mockPlonkVerifier.setResult(true)
				for (const w of directWithdrawals) {
					await rollupTestForWithdrawal.setTestData(w.blockNumber, w.blockHash)
				}

				// Submit the withdrawal proof
				await withdrawal.submitWithdrawalProof(
					directWithdrawals,
					validPublicInputs,
					'0x',
				)
				const tag = ethers.solidityPackedKeccak256(['string'], ['WITHDRAWAL'])
				expect(await contribution.latestTag()).to.equal(tag)
				expect(await contribution.latestUser()).to.equal(deployer.address)
				expect(await contribution.latestAmount()).to.equal(2)
			})
		})

		describe('fail', () => {
			it('only owner', async () => {
				const [withdrawal] = await loadFixture(setup)
				const { deployer, user } = await getSigners()

				const invalidWithdrawals = getChainedWithdrawals(1)

				const invalidPublicInputs = {
					lastWithdrawalHash: ethers.randomBytes(32),
					withdrawalAggregator: deployer.address,
				}

				await expect(
					withdrawal
						.connect(user)
						.submitWithdrawalProof(
							invalidWithdrawals,
							invalidPublicInputs,
							'0x',
						),
				)
					.to.be.revertedWithCustomError(
						withdrawal,
						'OwnableUnauthorizedAccount',
					)
					.withArgs(user.address)
			})
			it('should revert when withdrawal chain verification fails', async () => {
				const [withdrawal] = await loadFixture(setup)
				const { deployer } = await getSigners()

				const invalidWithdrawals = getChainedWithdrawals(1)

				const invalidPublicInputs = {
					lastWithdrawalHash: ethers.randomBytes(32),
					withdrawalAggregator: deployer.address,
				}

				await expect(
					withdrawal.submitWithdrawalProof(
						invalidWithdrawals,
						invalidPublicInputs,
						'0x',
					),
				).to.be.revertedWithCustomError(
					withdrawal,
					'WithdrawalChainVerificationFailed',
				)
			})

			it('should revert when withdrawal aggregator does not match msg.sender', async () => {
				const [withdrawal] = await loadFixture(setup)

				const validWithdrawals = getChainedWithdrawals(1)
				const lastWithdrawalHash = getPrevHashFromWithdrawals(validWithdrawals)
				const invalidPublicInputs = {
					lastWithdrawalHash: lastWithdrawalHash,
					withdrawalAggregator: ethers.Wallet.createRandom().address, // Different from msg.sender
				}

				await expect(
					withdrawal.submitWithdrawalProof(
						validWithdrawals,
						invalidPublicInputs,
						'0x',
					),
				).to.be.revertedWithCustomError(
					withdrawal,
					'WithdrawalAggregatorMismatch',
				)
			})

			it('should revert when withdrawal proof verification fails', async () => {
				const [withdrawal, , mockPlonkVerifier, rollupTestForWithdrawal] =
					await loadFixture(setup)
				const { deployer } = await getSigners()

				// Set MockPlonkVerifier to return false
				await mockPlonkVerifier.setResult(false)

				const validWithdrawals = getChainedWithdrawals(1)
				const lastWithdrawalHash = getPrevHashFromWithdrawals(validWithdrawals)

				const validPublicInputs = {
					lastWithdrawalHash: lastWithdrawalHash,
					withdrawalAggregator: deployer.address,
				}

				await expect(
					withdrawal.submitWithdrawalProof(
						validWithdrawals,
						validPublicInputs,
						'0x',
					),
				).to.be.revertedWithCustomError(
					withdrawal,
					'WithdrawalProofVerificationFailed',
				)
			})

			it('should revert when block hash does not exist', async () => {
				const [withdrawal, , , rollupTestForWithdrawal] =
					await loadFixture(setup)
				const { deployer } = await getSigners()

				//const invalidBlockHash = ethers.randomBytes(32)
				const blockNumber = 1

				const withdrawals = getChainedWithdrawals(1)

				const validPublicInputs = {
					lastWithdrawalHash: getPrevHashFromWithdrawals(withdrawals),
					withdrawalAggregator: deployer.address,
				}

				// Set a different block hash in the RollupTestForWithdrawal contract
				await rollupTestForWithdrawal.setTestData(blockNumber, ethers.ZeroHash)

				await expect(
					withdrawal.submitWithdrawalProof(
						withdrawals,
						validPublicInputs,
						'0x',
					),
				).to.be.revertedWithCustomError(withdrawal, 'BlockHashNotExists')
				expect(withdrawals[0].blockHash).to.not.equal(ethers.ZeroHash)
			})
		})
	})
	describe('DirectWithdrawalTokenIndices', () => {
		describe('success', () => {
			it('get token indices', async () => {
				const [withdrawal] = await loadFixture(setup)
				const indices = await withdrawal.getDirectWithdrawalTokenIndices()
				expect(indices).to.deep.equal(DIRECT_WITHDRAWAL_TOKEN_INDICES)
			})
			it('add token indices', async () => {
				const [withdrawal] = await loadFixture(setup)
				await withdrawal.addDirectWithdrawalTokenIndices([4, 5])
				const indices = await withdrawal.getDirectWithdrawalTokenIndices()
				expect(indices).to.deep.equal(
					DIRECT_WITHDRAWAL_TOKEN_INDICES.concat([4, 5]),
				)
			})
			it('remove token indices', async () => {
				const [withdrawal] = await loadFixture(setup)
				await withdrawal.removeDirectWithdrawalTokenIndices([1, 3])
				const indices = await withdrawal.getDirectWithdrawalTokenIndices()
				expect(indices).to.deep.equal([2])
			})
			it('emit DirectWithdrawalTokenIndicesAdded', async () => {
				const [withdrawal] = await loadFixture(setup)
				await expect(withdrawal.addDirectWithdrawalTokenIndices([4, 5]))
					.to.emit(withdrawal, 'DirectWithdrawalTokenIndicesAdded')
					.withArgs([4, 5])
			})
			it('emit DirectWithdrawalTokenIndicesRemoved', async () => {
				const [withdrawal] = await loadFixture(setup)
				await expect(withdrawal.removeDirectWithdrawalTokenIndices([1, 3]))
					.to.emit(withdrawal, 'DirectWithdrawalTokenIndicesRemoved')
					.withArgs([1, 3])
			})
		})
		describe('fail', () => {
			it('duplicate data.', async () => {
				const [withdrawal] = await loadFixture(setup)
				await expect(withdrawal.addDirectWithdrawalTokenIndices([1]))
					.to.be.revertedWithCustomError(withdrawal, 'TokenAlreadyExist')
					.withArgs(1)
			})
			it('remove token indices', async () => {
				const [withdrawal] = await loadFixture(setup)
				await expect(withdrawal.removeDirectWithdrawalTokenIndices([4]))
					.to.be.revertedWithCustomError(withdrawal, 'TokenNotExist')
					.withArgs(4)
			})
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [withdrawal] = await loadFixture(setup)
			const { deployer } = await getSigners()
			const withdrawal2Factory =
				await ethers.getContractFactory('Withdrawal2Test')
			const next = await upgrades.upgradeProxy(
				await withdrawal.getAddress(),
				withdrawal2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const owner = await withdrawal.owner()
			expect(owner).to.equal(deployer.address)
			const val = await next.getVal()
			expect(val).to.equal(3)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const [withdrawal] = await loadFixture(setup)
			const signers = await getSigners()
			const withdrawal2Factory = await ethers.getContractFactory(
				'Withdrawal2Test',
				signers.user,
			)
			await expect(
				upgrades.upgradeProxy(
					await withdrawal.getAddress(),
					withdrawal2Factory,
					{ unsafeAllow: ['constructor'] },
				),
			)
				.to.be.revertedWithCustomError(withdrawal, 'OwnableUnauthorizedAccount')
				.withArgs(signers.user.address)
		})
	})
})
