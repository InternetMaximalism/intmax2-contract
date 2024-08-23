import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import {
	Rollup,
	BlockBuilderRegistryTestForRollup,
	L2ScrollMessengerTestForRollup,
	ContributionTest,
} from '../../typechain-types'
import { loadPairingData } from '../../utils/rollup'
import block1 from '../../test_data/block1.json'

describe('Rollup', () => {
	const FIRST_BLOCK_HASH =
		'0x545cac70c52cf8589c16de1eb85e264d51e18adb15ac810db3f44efa190a1074'
	const FIRST_DEPOSIT_TREE_ROOT =
		'0xb6155ab566bbd2e341525fd88c43b4d69572bf4afe7df45cd74d6901a172e41c'
	const setup = async (): Promise<
		[
			Rollup,
			BlockBuilderRegistryTestForRollup,
			L2ScrollMessengerTestForRollup,
			ContributionTest,
		]
	> => {
		const blockBuilderRegistryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistryTestForRollup',
		)
		const blockBuilderRegistry =
			(await blockBuilderRegistryFactory.deploy()) as BlockBuilderRegistryTestForRollup
		const L2ScrollMessengerTestForRollupFactory =
			await ethers.getContractFactory('L2ScrollMessengerTestForRollup')
		const l2ScrollMessenger =
			(await L2ScrollMessengerTestForRollupFactory.deploy()) as L2ScrollMessengerTestForRollup
		const rollupFactory = await ethers.getContractFactory('Rollup')
		const liquidity = ethers.Wallet.createRandom().address
		const contributionTestFactory =
			await ethers.getContractFactory('ContributionTest')
		const contribution =
			(await contributionTestFactory.deploy()) as ContributionTest
		await l2ScrollMessenger.setResult(liquidity)
		const rollup = (await upgrades.deployProxy(
			rollupFactory,
			[
				await l2ScrollMessenger.getAddress(),
				liquidity,
				await blockBuilderRegistry.getAddress(),
				await contribution.getAddress(),
			],
			{ kind: 'uups' },
		)) as unknown as Rollup
		return [rollup, blockBuilderRegistry, l2ScrollMessenger, contribution]
	}

	type signers = {
		deployer: HardhatEthersSigner
		user1: HardhatEthersSigner
		user2: HardhatEthersSigner
		user3: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, user1, user2, user3] = await ethers.getSigners()
		return {
			deployer,
			user1,
			user2,
			user3,
		}
	}
	type validInputs = {
		txTreeRoot: string
		senderFlags: string
		aggregatedPublicKey: [string, string]
		aggregatedSignature: [string, string, string, string]
		messagePoint: [string, string, string, string]
		senderPublicKeys: bigint[]
	}
	const generateValidInputs = (): validInputs => {
		return {
			txTreeRoot:
				'0xe9fe591a2052682636a8019b6be712fd1e000544be4acfd8fc6bcaf8d750f7a0',
			senderFlags: '0xf6f27cffbbdff9cea5bc062a276505e2',
			aggregatedPublicKey: [
				block1.signature.aggPubkey[0],
				block1.signature.aggPubkey[1],
			] as [string, string],
			aggregatedSignature: [
				block1.signature.aggSignature[0],
				block1.signature.aggSignature[1],
				block1.signature.aggSignature[2],
				block1.signature.aggSignature[3],
			] as [string, string, string, string],
			messagePoint: [
				block1.signature.messagePoint[0],
				block1.signature.messagePoint[1],
				block1.signature.messagePoint[2],
				block1.signature.messagePoint[3],
			] as [string, string, string, string],
			senderPublicKeys: [BigInt(1), BigInt(2), BigInt(3)],
		}
	}
	const addBlock = async (
		rollup: Rollup,
		blockBuilderRegistry: BlockBuilderRegistryTestForRollup,
		signer: HardhatEthersSigner,
	): Promise<void> => {
		await blockBuilderRegistry.setResult(true)
		const inputs = generateValidInputs()
		await rollup
			.connect(signer)
			.postRegistrationBlock(
				inputs.txTreeRoot,
				inputs.senderFlags,
				inputs.aggregatedPublicKey,
				inputs.aggregatedSignature,
				inputs.messagePoint,
				inputs.senderPublicKeys,
			)
	}
	describe('initialize', () => {
		describe('success', () => {
			it('should set deployer as the owner', async () => {
				const [rollup] = await loadFixture(setup)
				const signers = await getSigners()
				expect(await rollup.owner()).to.equal(signers.deployer.address)
			})
			it('should update depositTreeRoot', async () => {
				const [rollup] = await loadFixture(setup)
				const depositTreeRoot = await rollup.depositTreeRoot()
				expect(depositTreeRoot).to.equal(FIRST_DEPOSIT_TREE_ROOT)
			})
			it('should add initial blockHash', async () => {
				const [rollup] = await loadFixture(setup)
				const blockHash = await rollup.blockHashes(0)
				expect(blockHash).to.equal(FIRST_BLOCK_HASH)
			})
			it('should add initial blockBuilder', async () => {
				const [rollup] = await loadFixture(setup)
				const blockBuilder = await rollup.blockBuilders(0)
				expect(blockBuilder).to.equal(ethers.ZeroAddress)
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const [rollup] = await loadFixture(setup)

				await expect(
					rollup.initialize(
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
					),
				).to.be.revertedWithCustomError(rollup, 'InvalidInitialization')
			})
		})
	})
	describe('postRegistrationBlock', () => {
		describe('success', () => {
			it('generate PubKeysPosted event', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)

				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				)
					.to.emit(rollup, 'PubKeysPosted')
					.withArgs(1, inputs.senderPublicKeys)
			})
			it('should add blockhash to blockHashes', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)

				const blockHash = await rollup.blockHashes(1)
				expect(blockHash).to.equal(
					'0xf533fdf726b5d9e1a648165063342ae1349735eac15b9206eb3707832aae357c',
				)
			})
			it('should add sender address to blockBuilders', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)
				const signers = await getSigners()

				await rollup
					.connect(signers.user1)
					.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					)

				const blockBuilder = await rollup.blockBuilders(1)
				expect(blockBuilder).to.equal(signers.user1.address)
			})
			it('generate BlockPosted event', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)
				const signers = await getSigners()

				const depositTreeRoot = await rollup.depositTreeRoot()
				await expect(
					rollup
						.connect(signers.user1)
						.postRegistrationBlock(
							inputs.txTreeRoot,
							inputs.senderFlags,
							inputs.aggregatedPublicKey,
							inputs.aggregatedSignature,
							inputs.messagePoint,
							inputs.senderPublicKeys,
						),
				)
					.to.emit(rollup, 'BlockPosted')
					.withArgs(
						FIRST_BLOCK_HASH,
						signers.user1.address,
						1,
						depositTreeRoot,
						'0x1b56ed5ee237a71b7c94d2ebbface7c6becf2ed08f6ba2264411febc98633772',
					)
			})
			it('call contribution', async () => {
				const [rollup, blockBuilderRegistry, , contribution] =
					await loadFixture(setup)
				const signers = await getSigners()
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)
				const tag = ethers.solidityPackedKeccak256(['string'], ['POST_BLOCK'])
				expect(await contribution.latestTag()).to.equal(tag)
				expect(await contribution.latestUser()).to.equal(
					signers.deployer.address,
				)
				expect(await contribution.latestAmount()).to.equal(1)
			})
		})
		describe('fail', () => {
			it('revert TooManySenderPublicKeys', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				inputs.senderPublicKeys = Array(129).fill(BigInt(1))
				await blockBuilderRegistry.setResult(true)

				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				).to.be.revertedWithCustomError(rollup, 'TooManySenderPublicKeys')
			})
			it('revert InvalidBlockBuilder', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(false)

				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				).to.be.revertedWithCustomError(rollup, 'InvalidBlockBuilder')
			})
			it('revert PairingCheckFailed', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)
				const pairingData = loadPairingData()
				inputs.aggregatedPublicKey[0] = pairingData.aggPubkey[0]
				inputs.aggregatedPublicKey[1] = pairingData.aggPubkey[1]
				inputs.aggregatedSignature[0] = pairingData.aggSignature[0]
				inputs.aggregatedSignature[1] = pairingData.aggSignature[1]
				inputs.aggregatedSignature[2] = pairingData.aggSignature[2]
				inputs.aggregatedSignature[3] = pairingData.aggSignature[3]
				inputs.messagePoint[0] = pairingData.messagePoint[0]
				inputs.messagePoint[1] = pairingData.messagePoint[1]
				inputs.messagePoint[2] = pairingData.messagePoint[2]
				inputs.messagePoint[3] = pairingData.messagePoint[3]

				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				).to.be.revertedWithCustomError(rollup, 'PairingCheckFailed')
			})
		})
	})

	describe('postNonRegistrationBlock', () => {
		type validInputs = {
			txTreeRoot: string
			senderFlags: string
			aggregatedPublicKey: [string, string]
			aggregatedSignature: [string, string, string, string]
			messagePoint: [string, string, string, string]
			publicKeysHash: string
			senderAccountIds: string
		}

		const generateValidInputs = (): validInputs => {
			return {
				txTreeRoot:
					'0xe9fe591a2052682636a8019b6be712fd1e000544be4acfd8fc6bcaf8d750f7a0',
				senderFlags: '0xf6f27cffbbdff9cea5bc062a276505e2',
				aggregatedPublicKey: [
					block1.signature.aggPubkey[0],
					block1.signature.aggPubkey[1],
				] as [string, string],
				aggregatedSignature: [
					block1.signature.aggSignature[0],
					block1.signature.aggSignature[1],
					block1.signature.aggSignature[2],
					block1.signature.aggSignature[3],
				] as [string, string, string, string],
				messagePoint: [
					block1.signature.messagePoint[0],
					block1.signature.messagePoint[1],
					block1.signature.messagePoint[2],
					block1.signature.messagePoint[3],
				] as [string, string, string, string],
				publicKeysHash:
					'0xc4edb51053c87905b17da182fe87c0432e2dcbe7b3620eb4f6ae585ba0b49797',
				senderAccountIds: '0x0102030405060708090a0b0c0d0e0f',
			}
		}
		describe('success', () => {
			it('generate AccountIdsPosted event', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				)
					.to.emit(rollup, 'AccountIdsPosted')
					.withArgs(1, inputs.senderAccountIds)
			})
			it('should add blockhash to blockHashes', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)

				const blockHash = await rollup.blockHashes(1)
				expect(blockHash).to.equal(
					'0xb9c6c3e130b158f83b6d595b4743e8c473be25aaf6f86a1cf995d87c4cde46e3',
				)
			})
			it('should add sender address to blockBuilders', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)
				const signers = await getSigners()

				await rollup
					.connect(signers.user1)
					.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					)

				const blockBuilder = await rollup.blockBuilders(1)
				expect(blockBuilder).to.equal(signers.user1.address)
			})
			it('generate BlockPosted event', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)
				const signers = await getSigners()
				const depositTreeRoot = await rollup.depositTreeRoot()

				await expect(
					rollup
						.connect(signers.user1)
						.postNonRegistrationBlock(
							inputs.txTreeRoot,
							inputs.senderFlags,
							inputs.aggregatedPublicKey,
							inputs.aggregatedSignature,
							inputs.messagePoint,
							inputs.publicKeysHash,
							inputs.senderAccountIds,
						),
				)
					.to.emit(rollup, 'BlockPosted')
					.withArgs(
						FIRST_BLOCK_HASH,
						signers.user1.address,
						1,
						depositTreeRoot,
						'0xbbd68029399208f3ff0895ac48162109373556e96c3ec2263d5fe696fba5c742',
					)
			})
			it('call contribution', async () => {
				const [rollup, blockBuilderRegistry, , contribution] =
					await loadFixture(setup)
				const signers = await getSigners()
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)
				const tag = ethers.solidityPackedKeccak256(['string'], ['POST_BLOCK'])
				expect(await contribution.latestTag()).to.equal(tag)
				expect(await contribution.latestUser()).to.equal(
					signers.deployer.address,
				)
				expect(await contribution.latestAmount()).to.equal(1)
			})
		})
		describe('fail', () => {
			it('revert TooManyAccountIds', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				inputs.senderAccountIds = ethers.hexlify(ethers.randomBytes(5 * 129))
				await blockBuilderRegistry.setResult(true)

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'TooManyAccountIds')
			})
			it('revert SenderAccountIdsInvalidLength', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				inputs.senderAccountIds = ethers.hexlify(ethers.randomBytes(7)) // 7バイト (5の倍数ではない)
				await blockBuilderRegistry.setResult(true)

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'SenderAccountIdsInvalidLength')
			})
			it('revert InvalidBlockBuilder', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(false)

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'InvalidBlockBuilder')
			})
			it('revert PairingCheckFailed', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const inputs = generateValidInputs()
				await blockBuilderRegistry.setResult(true)
				const pairingData = loadPairingData()
				inputs.aggregatedPublicKey[0] = pairingData.aggPubkey[0]
				inputs.aggregatedPublicKey[1] = pairingData.aggPubkey[1]
				inputs.aggregatedSignature[0] = pairingData.aggSignature[0]
				inputs.aggregatedSignature[1] = pairingData.aggSignature[1]
				inputs.aggregatedSignature[2] = pairingData.aggSignature[2]
				inputs.aggregatedSignature[3] = pairingData.aggSignature[3]
				inputs.messagePoint[0] = pairingData.messagePoint[0]
				inputs.messagePoint[1] = pairingData.messagePoint[1]
				inputs.messagePoint[2] = pairingData.messagePoint[2]
				inputs.messagePoint[3] = pairingData.messagePoint[3]

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'PairingCheckFailed')
			})
		})
	})
	describe('processDeposits', () => {
		describe('success', () => {
			it('should update lastProcessedDepositId', async () => {
				const [rollup, , l2ScrollMessenger] = await loadFixture(setup)
				const lastProcessedDepositId = 10
				const depositHashes = [ethers.randomBytes(32), ethers.randomBytes(32)]

				await l2ScrollMessenger.processDeposits(
					await rollup.getAddress(),
					lastProcessedDepositId,
					depositHashes,
				)

				expect(await rollup.lastProcessedDepositId()).to.equal(
					lastProcessedDepositId,
				)
			})

			it('should update depositTreeRoot', async () => {
				const [rollup, , l2ScrollMessenger] = await loadFixture(setup)
				const lastProcessedDepositId = 10
				const depositHashes = [ethers.randomBytes(32), ethers.randomBytes(32)]

				const oldDepositTreeRoot = await rollup.depositTreeRoot()
				await l2ScrollMessenger.processDeposits(
					await rollup.getAddress(),
					lastProcessedDepositId,
					depositHashes,
				)
				const newDepositTreeRoot = await rollup.depositTreeRoot()

				expect(newDepositTreeRoot).to.not.equal(oldDepositTreeRoot)
			})

			it('should emit DepositsProcessed event', async () => {
				const [rollup, , l2ScrollMessenger] = await loadFixture(setup)
				const lastProcessedDepositId = 10
				const depositHashes = [ethers.randomBytes(32), ethers.randomBytes(32)]
				await l2ScrollMessenger.processDeposits(
					await rollup.getAddress(),
					lastProcessedDepositId,
					depositHashes,
				)
				const filter = rollup.filters.DepositsProcessed()
				const events = await rollup.queryFilter(filter)
				const newDepositTreeRoot = await rollup.depositTreeRoot()
				expect(events[0].args.lastProcessedDepositId).to.equal(
					lastProcessedDepositId,
				)
				expect(events[0].args.depositTreeRoot).to.equal(newDepositTreeRoot)
			})
		})

		describe('access control', () => {
			it('should revert if not called by L2ScrollMessenger', async () => {
				const [rollup, ,] = await loadFixture(setup)
				const signers = await getSigners()
				const lastProcessedDepositId = 10
				const depositHashes = [ethers.randomBytes(32)]

				await expect(
					rollup
						.connect(signers.user1)
						.processDeposits(lastProcessedDepositId, depositHashes),
				).to.be.revertedWithCustomError(rollup, 'OnlyScrollMessenger')
			})

			it('should revert if xDomainMessageSender is not liquidity contract', async () => {
				const [rollup, , l2ScrollMessenger] = await loadFixture(setup)
				const signers = await getSigners()
				const lastProcessedDepositId = 10
				const depositHashes = [ethers.randomBytes(32)]

				await l2ScrollMessenger.setResult(signers.user1.address) // Set incorrect liquidity address
				await expect(
					l2ScrollMessenger.processDeposits(
						await rollup.getAddress(),
						lastProcessedDepositId,
						depositHashes,
					),
				).to.be.revertedWithCustomError(rollup, 'OnlyLiquidity')
			})
		})
	})
	describe('getBlockBuilder', () => {
		describe('success cases', () => {
			it('should return the correct block builder for the genesis block', async () => {
				const [rollup] = await loadFixture(setup)
				const genesisBlockBuilder = await rollup.getBlockBuilder(0)
				expect(genesisBlockBuilder).to.equal(ethers.ZeroAddress)
			})

			it('should return the correct block builder for a non-genesis block', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await addBlock(rollup, blockBuilderRegistry, signers.user1)
				const blockBuilder = await rollup.getBlockBuilder(1)
				expect(blockBuilder).to.equal(signers.user1.address)
			})

			it('should return the correct block builder after multiple blocks have been added', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await addBlock(rollup, blockBuilderRegistry, signers.user1)
				await addBlock(rollup, blockBuilderRegistry, signers.user2)
				await addBlock(rollup, blockBuilderRegistry, signers.user3)

				expect(await rollup.getBlockBuilder(1)).to.equal(signers.user1.address)
				expect(await rollup.getBlockBuilder(2)).to.equal(signers.user2.address)
				expect(await rollup.getBlockBuilder(3)).to.equal(signers.user3.address)
			})
		})

		describe('failure cases', () => {
			it('should revert when querying a non-existent block number', async () => {
				const [rollup] = await loadFixture(setup)
				await expect(rollup.getBlockBuilder(1)).to.be.revertedWithCustomError(
					rollup,
					'BlockNumberOutOfRange',
				)
			})
		})
	})
	describe('getBlockHash', () => {
		describe('success cases', () => {
			it('should return the correct hash for the genesis block', async () => {
				const [rollup] = await loadFixture(setup)
				const genesisBlockHash = await rollup.getBlockHash(0)
				expect(genesisBlockHash).to.equal(FIRST_BLOCK_HASH)
			})

			it('should return the correct hash for a non-genesis block', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()
				await addBlock(rollup, blockBuilderRegistry, signers.user1)

				const blockHash = await rollup.getBlockHash(1)

				expect(blockHash).to.not.equal(ethers.ZeroHash)
			})

			it('should return the correct hashes after multiple blocks have been added', async () => {
				const [rollup, blockBuilderRegistry] = await loadFixture(setup)
				const signers = await getSigners()

				await addBlock(rollup, blockBuilderRegistry, signers.user1)
				await addBlock(rollup, blockBuilderRegistry, signers.user1)

				const blockHash1 = await rollup.getBlockHash(1)
				const blockHash2 = await rollup.getBlockHash(2)

				expect(blockHash1).to.not.equal(ethers.ZeroHash)
				expect(blockHash2).to.not.equal(ethers.ZeroHash)
				expect(blockHash1).to.not.equal(blockHash2)
			})
		})

		describe('failure cases', () => {
			it('should revert when querying a non-existent block number', async () => {
				const [rollup] = await loadFixture(setup)
				await expect(rollup.getBlockHash(1)).to.be.revertedWithCustomError(
					rollup,
					'BlockNumberOutOfRange',
				)
			})
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [rollup] = await loadFixture(setup)

			const rollup2Factory = await ethers.getContractFactory('Rollup2Test')
			const next = await upgrades.upgradeProxy(
				await rollup.getAddress(),
				rollup2Factory,
			)
			const hash = await rollup.blockHashes(0)
			expect(hash).to.equal(FIRST_BLOCK_HASH)
			const val = await next.getVal()
			expect(val).to.equal(2)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const [rollup] = await loadFixture(setup)
			const signers = await getSigners()
			const rollupFactory = await ethers.getContractFactory(
				'Rollup2Test',
				signers.user1,
			)
			await expect(
				upgrades.upgradeProxy(await rollup.getAddress(), rollupFactory),
			)
				.to.be.revertedWithCustomError(rollup, 'OwnableUnauthorizedAccount')
				.withArgs(signers.user1.address)
		})
	})
})
