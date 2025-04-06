import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import {
	Rollup,
	L2ScrollMessengerTestForRollup,
	ContributionTest,
} from '../../typechain-types'
import { loadPairingData } from '../../scripts/utils/rollup'
import block1 from '../../test_data/block1.json'
import { ContractTransactionResponse } from 'ethers'
describe('Rollup', () => {
	const FIRST_BLOCK_HASH =
		'0x4c31b986e463b14e7defe40aa79c4a6479cfdf134fde381d7ea90711d5fbfea2'
	const FIRST_DEPOSIT_TREE_ROOT =
		'0x9b8a14ee4c3d5e0ad67b0f3a7a2923af6c7c83fd0f5b90e00c54aeb6f57a2efe'
	const NUM_SENDERS_IN_BLOCK = 128
	const setup = async (): Promise<
		[Rollup, L2ScrollMessengerTestForRollup, ContributionTest]
	> => {
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
		const { admin } = await getSigners()

		const fixedPointOne = ethers.parseEther('1')
		const rateLimitTargetInterval = fixedPointOne * 30n // 30 seconds
		const rateLimitAlpha = fixedPointOne / 3n // 1/3
		const rateLimitK = fixedPointOne / 1000n // 0.001
		const rollup = (await upgrades.deployProxy(
			rollupFactory,
			[
				admin.address,
				await l2ScrollMessenger.getAddress(),
				liquidity,
				await contribution.getAddress(),
				rateLimitTargetInterval,
				rateLimitAlpha,
				rateLimitK,
			],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as Rollup
		return [rollup, l2ScrollMessenger, contribution]
	}
	const getGasCost = async (
		res: ContractTransactionResponse,
	): Promise<bigint> => {
		const transaction = await res.wait()
		return ethers.toBigInt(transaction!.gasPrice * transaction!.gasUsed)
	}
	type signers = {
		deployer: HardhatEthersSigner
		admin: HardhatEthersSigner
		user1: HardhatEthersSigner
		user2: HardhatEthersSigner
		user3: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, admin, user1, user2, user3] = await ethers.getSigners()
		return {
			deployer,
			admin,
			user1,
			user2,
			user3,
		}
	}
	type validInputs = {
		txTreeRoot: string
		expiry: number
		builderNonce: number
		senderFlags: string
		aggregatedPublicKey: [string, string]
		aggregatedSignature: [string, string, string, string]
		messagePoint: [string, string, string, string]
		senderPublicKeys: bigint[]
	}
	const generateValidInputs = async (): Promise<validInputs> => {
		const timestamp = await time.latest()
		return {
			txTreeRoot:
				'0xe9fe591a2052682636a8019b6be712fd1e000544be4acfd8fc6bcaf8d750f7a0',
			expiry: timestamp + 100,
			builderNonce: 1,
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
		signer: HardhatEthersSigner,
	): Promise<void> => {
		const inputs = await generateValidInputs()
		await rollup.connect(signer).postRegistrationBlock(
			inputs.txTreeRoot,
			inputs.expiry,
			inputs.builderNonce,
			inputs.senderFlags,
			inputs.aggregatedPublicKey,
			inputs.aggregatedSignature,
			inputs.messagePoint,
			inputs.senderPublicKeys,
			{ value: ethers.parseEther('1') }, // pay enough penalty
		)
	}
	const getPublicKeysHash = (keys: bigint[]): string => {
		const paddedKeys = Array(NUM_SENDERS_IN_BLOCK).fill(BigInt(1))
		for (let i = 0; i < keys.length; i++) {
			paddedKeys[i] = keys[i]
		}
		const tmp = Array(NUM_SENDERS_IN_BLOCK).fill('uint256')
		const packed = ethers.solidityPacked(tmp, paddedKeys)
		const hash = ethers.keccak256(packed)
		return hash
	}
	const getSignatureHash = (
		isRegistrationBlock: boolean,
		txTreeRoot: string,
		expiry: number,
		builderAddress: string,
		builderNonce: number,
		senderFlags: string,
		publicKeysHash: string,
		accountIdsHash: string,
		aggregatedPublicKey: string[],
		aggregatedSignature: string[],
		messagePoint: string[],
	): string => {
		const tmp = isRegistrationBlock ? 1 : 0
		const packed = ethers.solidityPacked(
			[
				'uint32',
				'bytes32',
				'uint64',
				'address',
				'uint32',
				'bytes16',
				'bytes32',
				'bytes32',
				'bytes32[]',
				'bytes32[]',
				'bytes32[]',
			],
			[
				tmp,
				txTreeRoot,
				expiry,
				builderAddress,
				builderNonce,
				senderFlags,
				publicKeysHash,
				accountIdsHash,
				aggregatedPublicKey,
				aggregatedSignature,
				messagePoint,
			],
		)
		const hash = ethers.keccak256(packed)
		return hash
	}
	const getBlockHash = (
		prevBlockHash: string,
		depositTreeRoot: string,
		signatureHash: string,
		timestamp: number,
		blockNumber: number,
	): String => {
		const packed = ethers.solidityPacked(
			['bytes32', 'bytes32', 'bytes32', 'uint64', 'uint32'],
			[prevBlockHash, depositTreeRoot, signatureHash, timestamp, blockNumber],
		)
		const hash = ethers.keccak256(packed)
		return hash
	}
	describe('constructor', () => {
		it('should revert if not initialized through proxy', async () => {
			const rollupFactory = await ethers.getContractFactory('Rollup')
			const rollup = (await rollupFactory.deploy()) as unknown as Rollup
			await expect(
				rollup.initialize(
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					0,
					0,
					0,
				),
			).to.be.revertedWithCustomError(rollup, 'InvalidInitialization')
		})
	})
	describe('initialize', () => {
		describe('success', () => {
			it('should set deployer as the owner', async () => {
				const [rollup] = await loadFixture(setup)
				const signers = await getSigners()
				expect(await rollup.owner()).to.equal(signers.admin.address)
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
						0,
						0,
						0,
					),
				).to.be.revertedWithCustomError(rollup, 'InvalidInitialization')
			})
			it('admin is zero address', async () => {
				const rollupFactory = await ethers.getContractFactory('Rollup')
				const tmpAddress = ethers.Wallet.createRandom().address

				await expect(
					upgrades.deployProxy(
						rollupFactory,
						[ethers.ZeroAddress, tmpAddress, tmpAddress, tmpAddress, 0, 0, 0],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(rollupFactory, 'AddressZero')
			})
			it('scrollMessenger is zero address', async () => {
				const rollupFactory = await ethers.getContractFactory('Rollup')
				const tmpAddress = ethers.Wallet.createRandom().address

				await expect(
					upgrades.deployProxy(
						rollupFactory,
						[tmpAddress, ethers.ZeroAddress, tmpAddress, tmpAddress, 0, 0, 0],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(rollupFactory, 'AddressZero')
			})
			it('liquidity is zero address', async () => {
				const rollupFactory = await ethers.getContractFactory('Rollup')
				const tmpAddress = ethers.Wallet.createRandom().address

				await expect(
					upgrades.deployProxy(
						rollupFactory,
						[tmpAddress, tmpAddress, ethers.ZeroAddress, tmpAddress, 0, 0, 0],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(rollupFactory, 'AddressZero')
			})
			it('contribution is zero address', async () => {
				const rollupFactory = await ethers.getContractFactory('Rollup')
				const tmpAddress = ethers.Wallet.createRandom().address

				await expect(
					upgrades.deployProxy(
						rollupFactory,
						[tmpAddress, tmpAddress, tmpAddress, ethers.ZeroAddress, 0, 0, 0],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(rollupFactory, 'AddressZero')
			})
		})
	})

	describe('postRegistrationBlock', () => {
		describe('success', () => {
			it('send penalty fee', async () => {
				const [rollup] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const inputs = await generateValidInputs()

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)
				const beforeRollupBalance = await ethers.provider.getBalance(
					rollup.getAddress(),
				)
				expect(beforeRollupBalance).to.equal(0)
				const beforeCallerBalance = await ethers.provider.getBalance(
					deployer.address,
				)
				const tx = await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce + 1,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
					{ value: ethers.parseEther('1') },
				)
				const afterCallerBalance = await ethers.provider.getBalance(
					deployer.address,
				)
				const gas = await getGasCost(tx)
				const afterRollupBalance = await ethers.provider.getBalance(
					rollup.getAddress(),
				)
				expect(afterRollupBalance).not.to.equal(0)
				expect(afterRollupBalance < ethers.parseEther('1')).to.be.true
				expect(afterCallerBalance).to.equal(
					beforeCallerBalance - gas - afterRollupBalance,
				)
			})
			it('not send penalty fee', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)
				await time.increase(30)
				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce + 1,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)
			})
			it('should add blockhash to blockHashes', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				const { deployer } = await getSigners()

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)
				const timestamp = await time.latest()

				const blockHash = await rollup.blockHashes(1)

				const prevBlockHash = await rollup.blockHashes(0)
				const publicKeysHash = getPublicKeysHash(inputs.senderPublicKeys)
				const signatureHash = getSignatureHash(
					true,
					inputs.txTreeRoot,
					inputs.expiry,
					deployer.address,
					inputs.builderNonce,
					inputs.senderFlags,
					publicKeysHash,
					ethers.ZeroHash,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
				)

				const currentBlockHash = getBlockHash(
					prevBlockHash,
					FIRST_DEPOSIT_TREE_ROOT,
					signatureHash,
					timestamp,
					1,
				)
				expect(blockHash).to.equal(currentBlockHash)
			})
			it('generate BlockPosted event', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				const signers = await getSigners()

				const depositTreeRoot = await rollup.depositTreeRoot()
				const timestamp = await time.latest()
				const publicKeysHash = getPublicKeysHash(inputs.senderPublicKeys)
				const signatureHash = getSignatureHash(
					true,
					inputs.txTreeRoot,
					inputs.expiry,
					signers.user1.address,
					inputs.builderNonce,
					inputs.senderFlags,
					publicKeysHash,
					ethers.ZeroHash,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
				)
				await expect(
					rollup
						.connect(signers.user1)
						.postRegistrationBlock(
							inputs.txTreeRoot,
							inputs.expiry,
							inputs.builderNonce,
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
						timestamp + 1,
						1,
						depositTreeRoot,
						signatureHash,
					)
			})
			it('call contribution', async () => {
				const [rollup, , contribution] = await loadFixture(setup)
				const signers = await getSigners()
				const inputs = await generateValidInputs()

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
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
			it('should update builderRegistrationNonce', async () => {
				const [rollup] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const inputs = await generateValidInputs()

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)

				const nonce = await rollup.builderRegistrationNonce(deployer.address)
				expect(nonce).to.equal(inputs.builderNonce + 1)
			})
			it('should allow nonce=0 to bypass nonce check', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				// First set a nonce
				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)

				// Then use nonce=0 which should bypass the check
				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					0, // nonce = 0 bypasses check
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
					{ value: ethers.parseEther('1') }, // pay enough penalty
				)
			})
		})
		describe('fail', () => {
			it('expiry < block.timestamp', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				inputs.expiry = 1

				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				).to.be.revertedWithCustomError(rollup, 'Expired')
			})
			it('revert TooManySenderPublicKeys', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				inputs.senderPublicKeys = Array(129).fill(BigInt(1))

				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				).to.be.revertedWithCustomError(rollup, 'TooManySenderPublicKeys')
			})
			it('revert PairingCheckFailed', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
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
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				).to.be.revertedWithCustomError(rollup, 'PairingCheckFailed')
			})
			it('revert InsufficientPenaltyFee', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)
				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce + 1,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
					),
				).to.be.revertedWithCustomError(rollup, 'InsufficientPenaltyFee')
			})
			it('revert InvalidNonce', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				// First set a nonce
				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)

				// Then try to use a lower nonce
				await expect(
					rollup.postRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce, // Same nonce as before (should be incremented)
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.senderPublicKeys,
						{ value: ethers.parseEther('1') }, // pay enough penalty
					),
				).to.be.revertedWithCustomError(rollup, 'InvalidNonce')
			})
		})
	})

	describe('postNonRegistrationBlock', () => {
		type validInputs = {
			txTreeRoot: string
			expiry: number
			builderNonce: number
			senderFlags: string
			aggregatedPublicKey: [string, string]
			aggregatedSignature: [string, string, string, string]
			messagePoint: [string, string, string, string]
			publicKeysHash: string
			senderAccountIds: string
		}

		const generateValidInputs = async (): Promise<validInputs> => {
			const timestamp = await time.latest()
			return {
				txTreeRoot:
					'0xe9fe591a2052682636a8019b6be712fd1e000544be4acfd8fc6bcaf8d750f7a0',
				expiry: timestamp + 100,
				builderNonce: 1,
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
		const getAccountIdsHash = (senderAccountIds: string): string => {
			const FULL_ACCOUNT_IDS_BYTES = NUM_SENDERS_IN_BLOCK * 5
			let senderBytes = ethers.getBytes(senderAccountIds)
			let paddedBytes = new Uint8Array(FULL_ACCOUNT_IDS_BYTES)
			paddedBytes.set(senderBytes)
			for (let i = senderBytes.length; i < FULL_ACCOUNT_IDS_BYTES; i += 5) {
				paddedBytes[i + 4] = 0x01
			}

			return ethers.keccak256(paddedBytes)
		}
		describe('success', () => {
			it('send penalty fee', async () => {
				const [rollup] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const inputs = await generateValidInputs()

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)
				const beforeRollupBalance = await ethers.provider.getBalance(
					rollup.getAddress(),
				)
				expect(beforeRollupBalance).to.equal(0)
				const beforeCallerBalance = await ethers.provider.getBalance(
					deployer.address,
				)
				const tx = await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce + 1,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
					{ value: ethers.parseEther('1') },
				)
				const afterCallerBalance = await ethers.provider.getBalance(
					deployer.address,
				)
				const gas = await getGasCost(tx)
				const afterRollupBalance = await ethers.provider.getBalance(
					rollup.getAddress(),
				)
				expect(afterRollupBalance).not.to.equal(0)
				expect(afterRollupBalance < ethers.parseEther('1')).to.be.true
				expect(afterCallerBalance).to.equal(
					beforeCallerBalance - gas - afterRollupBalance,
				)
			})
			it('not send penalty fee', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)
				await time.increase(30)
				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce + 1,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)
			})
			it('should add blockhash to blockHashes', async () => {
				const [rollup] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const inputs = await generateValidInputs()

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)
				const timestamp = await time.latest()
				const prevBlockHash = await rollup.blockHashes(0)
				const blockHash = await rollup.blockHashes(1)
				const signatureHash = getSignatureHash(
					false,
					inputs.txTreeRoot,
					inputs.expiry,
					deployer.address,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.publicKeysHash,
					getAccountIdsHash(inputs.senderAccountIds),
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
				)
				const currentBlockHash = getBlockHash(
					prevBlockHash,
					FIRST_DEPOSIT_TREE_ROOT,
					signatureHash,
					timestamp,
					1,
				)
				expect(blockHash).to.equal(currentBlockHash)
			})
			it('generate BlockPosted event', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				const signers = await getSigners()
				const depositTreeRoot = await rollup.depositTreeRoot()
				const timestamp = await time.latest()
				const signatureHash = getSignatureHash(
					false,
					inputs.txTreeRoot,
					inputs.expiry,
					signers.user1.address,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.publicKeysHash,
					getAccountIdsHash(inputs.senderAccountIds),
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
				)
				await expect(
					rollup
						.connect(signers.user1)
						.postNonRegistrationBlock(
							inputs.txTreeRoot,
							inputs.expiry,
							inputs.builderNonce,
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
						timestamp + 1,
						1,
						depositTreeRoot,
						signatureHash,
					)
			})
			it('call contribution', async () => {
				const [rollup, , contribution] = await loadFixture(setup)
				const signers = await getSigners()
				const inputs = await generateValidInputs()

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
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
			it('should update builderNonRegistrationNonce', async () => {
				const [rollup] = await loadFixture(setup)
				const { deployer } = await getSigners()
				const inputs = await generateValidInputs()

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)

				const nonce = await rollup.builderNonRegistrationNonce(deployer.address)
				expect(nonce).to.equal(inputs.builderNonce + 1)
			})
			it('should allow nonce=0 to bypass nonce check', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				// First set a nonce
				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)

				// Then use nonce=0 which should bypass the check
				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					0, // nonce = 0 bypasses check
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
					{ value: ethers.parseEther('1') }, // pay enough penalty
				)
			})
		})

		describe('fail', () => {
			it('expiry < block.timestamp', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				inputs.expiry = 1

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'Expired')
			})
			it('revert TooManyAccountIds', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				inputs.senderAccountIds = ethers.hexlify(ethers.randomBytes(5 * 129))

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'TooManyAccountIds')
			})
			it('revert TooManyAccountIds', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				inputs.senderAccountIds = ethers.hexlify(ethers.randomBytes(5 * 129))

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce,
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
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
				inputs.senderAccountIds = ethers.hexlify(ethers.randomBytes(7)) // 7 bytes (not a multiple of 5)

				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'SenderAccountIdsInvalidLength')
			})
			it('revert PairingCheckFailed', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()
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
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'PairingCheckFailed')
			})
			it('revert InsufficientPenaltyFee', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)
				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce,
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
					),
				).to.be.revertedWithCustomError(rollup, 'InsufficientPenaltyFee')
			})
			it('revert InvalidNonce', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				// First set a nonce
				await rollup.postNonRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.publicKeysHash,
					inputs.senderAccountIds,
				)

				// Then try to use a lower nonce
				await expect(
					rollup.postNonRegistrationBlock(
						inputs.txTreeRoot,
						inputs.expiry,
						inputs.builderNonce, // Same nonce as before (should be incremented)
						inputs.senderFlags,
						inputs.aggregatedPublicKey,
						inputs.aggregatedSignature,
						inputs.messagePoint,
						inputs.publicKeysHash,
						inputs.senderAccountIds,
						{ value: ethers.parseEther('1') }, // pay enough penalty
					),
				).to.be.revertedWithCustomError(rollup, 'InvalidNonce')
			})
		})
	})

	describe('withdrawPenaltyFee', () => {
		describe('success', () => {
			it('not send penalty fee', async () => {
				const [rollup] = await loadFixture(setup)
				const inputs = await generateValidInputs()

				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
				)
				await rollup.postRegistrationBlock(
					inputs.txTreeRoot,
					inputs.expiry,
					inputs.builderNonce + 1,
					inputs.senderFlags,
					inputs.aggregatedPublicKey,
					inputs.aggregatedSignature,
					inputs.messagePoint,
					inputs.senderPublicKeys,
					{ value: ethers.parseEther('1') },
				)
				const beforeRollupBalance = await ethers.provider.getBalance(
					rollup.getAddress(),
				)
				expect(beforeRollupBalance).not.to.equal(0)
				const toAddress = ethers.Wallet.createRandom().address
				const beforeToAddressBalance =
					await ethers.provider.getBalance(toAddress)
				expect(beforeToAddressBalance).to.equal(0)
				const { admin } = await getSigners()
				await rollup.connect(admin).withdrawPenaltyFee(toAddress)

				const afterRollupBalance = await ethers.provider.getBalance(
					rollup.getAddress(),
				)
				expect(afterRollupBalance).to.equal(0)
				const afterToAddressBalance =
					await ethers.provider.getBalance(toAddress)
				expect(afterToAddressBalance).to.equal(beforeRollupBalance)
			})
		})
		describe('fail', () => {
			it('only owner', async () => {
				const [rollup] = await loadFixture(setup)
				const { user1 } = await getSigners()
				await expect(rollup.connect(user1).withdrawPenaltyFee(user1.address))
					.to.be.revertedWithCustomError(rollup, 'OwnableUnauthorizedAccount')
					.withArgs(user1.address)
			})
		})
	})

	describe('processDeposits', () => {
		describe('success', () => {
			it('should update lastProcessedDepositId', async () => {
				const [rollup, l2ScrollMessenger] = await loadFixture(setup)
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
				const [rollup, l2ScrollMessenger] = await loadFixture(setup)
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
				const [rollup, l2ScrollMessenger] = await loadFixture(setup)
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
			it('should emit DepositLeafInserted event', async () => {
				const [rollup, l2ScrollMessenger] = await loadFixture(setup)
				const lastProcessedDepositId = 10
				const depositHashes1 = [ethers.randomBytes(32), ethers.randomBytes(32)]
				const depositHashes2 = [ethers.randomBytes(32), ethers.randomBytes(32)]
				await l2ScrollMessenger.processDeposits(
					await rollup.getAddress(),
					lastProcessedDepositId,
					depositHashes1,
				)
				const filter = rollup.filters.DepositLeafInserted()
				const events = await rollup.queryFilter(filter)
				expect(events[0].args.depositIndex).to.equal(0)
				expect(events[0].args.depositHash).to.equal(
					ethers.hexlify(depositHashes1[0]),
				)

				expect(events[1].args.depositIndex).to.equal(1)
				expect(events[1].args.depositHash).to.equal(
					ethers.hexlify(depositHashes1[1]),
				)

				await l2ScrollMessenger.processDeposits(
					await rollup.getAddress(),
					lastProcessedDepositId,
					depositHashes2,
				)
				const events2 = await rollup.queryFilter(filter)
				expect(events2[2].args.depositIndex).to.equal(2)
				expect(events2[2].args.depositHash).to.equal(
					ethers.hexlify(depositHashes2[0]),
				)

				expect(events2[3].args.depositIndex).to.equal(3)
				expect(events2[3].args.depositHash).to.equal(
					ethers.hexlify(depositHashes2[1]),
				)
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
				const [rollup, l2ScrollMessenger] = await loadFixture(setup)
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
	describe('getBlockHash', () => {
		describe('success cases', () => {
			it('should return the correct hash for the genesis block', async () => {
				const [rollup] = await loadFixture(setup)
				const genesisBlockHash = await rollup.getBlockHash(0)
				expect(genesisBlockHash).to.equal(FIRST_BLOCK_HASH)
			})

			it('should return the correct hash for a non-genesis block', async () => {
				const [rollup] = await loadFixture(setup)
				const signers = await getSigners()
				await addBlock(rollup, signers.user1)

				const blockHash = await rollup.getBlockHash(1)

				expect(blockHash).to.not.equal(ethers.ZeroHash)
			})

			it('should return the correct hashes after multiple blocks have been added', async () => {
				const [rollup] = await loadFixture(setup)
				const signers = await getSigners()

				await addBlock(rollup, signers.user1)
				await addBlock(rollup, signers.user2) // change sender to avoid nonce increment

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

	describe('getPenalty', () => {
		it('get penalty', async () => {
			const [rollup] = await loadFixture(setup)
			const penalty = await rollup.getPenalty()
			expect(penalty).to.equal(0)
		})
	})

	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const [rollup] = await loadFixture(setup)
			const { admin } = await getSigners()
			const rollup2Factory = await ethers.getContractFactory(
				'Rollup2Test',
				admin,
			)
			const next = await upgrades.upgradeProxy(
				await rollup.getAddress(),
				rollup2Factory,
				{ unsafeAllow: ['constructor'] },
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
				upgrades.upgradeProxy(await rollup.getAddress(), rollupFactory, {
					unsafeAllow: ['constructor'],
				}),
			)
				.to.be.revertedWithCustomError(rollup, 'OwnableUnauthorizedAccount')
				.withArgs(signers.user1.address)
		})
	})
})
