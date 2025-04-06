import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import {
	Claim,
	L2ScrollMessengerTestForClaim,
	MockPlonkVerifier,
	RollupTestForClaim,
	ContributionTest,
} from '../../typechain-types'

describe('Claim', () => {
	type TestObjects = {
		claim: Claim
		scrollMessenger: L2ScrollMessengerTestForClaim
		mockPlonkVerifier: MockPlonkVerifier
		rollupTestForClaim: RollupTestForClaim
		liquidityAddress: string
		contributionTest: ContributionTest
	}
	async function setup(): Promise<TestObjects> {
		const l2ScrollMessengerFactory = await ethers.getContractFactory(
			'L2ScrollMessengerTestForClaim',
		)
		const scrollMessenger = await l2ScrollMessengerFactory.deploy()
		const mockPlonkVerifierFactory =
			await ethers.getContractFactory('MockPlonkVerifier')
		const mockPlonkVerifier = await mockPlonkVerifierFactory.deploy()
		const rollupTestForClaimFactory =
			await ethers.getContractFactory('RollupTestForClaim')
		const rollupTestForClaim = await rollupTestForClaimFactory.deploy()
		const liquidityAddress = ethers.Wallet.createRandom().address
		const contributionTestFactory =
			await ethers.getContractFactory('ContributionTest')
		const contributionTest =
			(await contributionTestFactory.deploy()) as ContributionTest
		const claimFactory = await ethers.getContractFactory('Claim')
		const { admin } = await getSigners()
		const claim = (await upgrades.deployProxy(
			claimFactory,
			[
				admin.address,
				await scrollMessenger.getAddress(),
				await mockPlonkVerifier.getAddress(),
				liquidityAddress,
				await rollupTestForClaim.getAddress(),
				await contributionTest.getAddress(),
				60 * 60, // 1 hour
			],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as Claim
		return {
			claim,
			scrollMessenger,
			mockPlonkVerifier,
			rollupTestForClaim,
			liquidityAddress,
			contributionTest,
		}
	}
	type signers = {
		deployer: HardhatEthersSigner
		admin: HardhatEthersSigner
		user1: HardhatEthersSigner
		user2: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, admin, user1, user2] = await ethers.getSigners()
		return {
			deployer,
			admin,
			user1,
			user2,
		}
	}
	const generateTestClaimProofPublicInputs = async (claim) => {
		const lastClaimHash = hashWithPrevHash(claim, ethers.ZeroHash)
		const { user1 } = await getSigners()
		const claimAggregator = user1.address
		return { lastClaimHash, claimAggregator }
	}
	const generateTestProof = () => {
		return ethers.hexlify(ethers.randomBytes(64))
	}
	const generateTestClaimsList = async (userAddresses: string[]) => {
		return userAddresses.map((address) => {
			return {
				recipient: address,
				amount: ethers.parseEther('0.1'),
				nullifier: ethers.hexlify(ethers.randomBytes(32)),
				blockHash: ethers.hexlify(ethers.randomBytes(32)),
				blockNumber: 1,
			}
		})
	}
	const generateTestArgs = async (userAddresses: string[]) => {
		const claims = await generateTestClaimsList(userAddresses)
		const claimProofPublicInputs = await generateTestClaimProofPublicInputs(
			claims[0],
		)
		const proof = generateTestProof()
		return { claims, claimProofPublicInputs, proof }
	}
	const hashWithPrevHash = (claim, prevClaimHash) => {
		const packed = ethers.solidityPacked(
			['bytes32', 'address', 'uint256', 'bytes32', 'bytes32', 'uint32'],
			[
				prevClaimHash,
				claim.recipient,
				claim.amount,
				claim.nullifier,
				claim.blockHash,
				claim.blockNumber,
			],
		)
		return ethers.keccak256(packed)
	}
	describe('constructor', () => {
		it('should revert if not initialized through proxy', async () => {
			const claimFactory = await ethers.getContractFactory('Claim')
			const claim = await claimFactory.deploy()
			await expect(
				claim.initialize(
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					0,
				),
			).to.be.revertedWithCustomError(claim, 'InvalidInitialization')
		})
	})
	describe('initialize', () => {
		describe('success', () => {
			it('set admin address', async () => {
				const { claim } = await loadFixture(setup)
				const { admin } = await getSigners()
				expect(await claim.owner()).to.equal(admin.address)
			})
			it('set start time', async () => {
				const { claim } = await loadFixture(setup)
				const getCurrentPeriod = await claim.getCurrentPeriod()
				expect(getCurrentPeriod).to.equal(0)
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const { claim } = await loadFixture(setup)
				await expect(
					claim.initialize(
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						0,
					),
				).to.be.revertedWithCustomError(claim, 'InvalidInitialization')
			})
			it('admin address is 0', async () => {
				const claimFactory = await ethers.getContractFactory('Claim')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						claimFactory,
						[
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							0,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(claimFactory, 'AddressZero')
			})
			it('scroll messenger address is 0', async () => {
				const claimFactory = await ethers.getContractFactory('Claim')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						claimFactory,
						[
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							0,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(claimFactory, 'AddressZero')
			})
			it('claim verifier address is 0', async () => {
				const claimFactory = await ethers.getContractFactory('Claim')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						claimFactory,
						[
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							0,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(claimFactory, 'AddressZero')
			})
			it('liquidity address is 0', async () => {
				const claimFactory = await ethers.getContractFactory('Claim')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						claimFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							0,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(claimFactory, 'AddressZero')
			})
			it('rollup address is 0', async () => {
				const claimFactory = await ethers.getContractFactory('Claim')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						claimFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							0,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(claimFactory, 'AddressZero')
			})
			it('contribution address is 0', async () => {
				const claimFactory = await ethers.getContractFactory('Claim')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						claimFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							0,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(claimFactory, 'AddressZero')
			})
		})
	})

	describe('updateVerifier', () => {
		describe('success', () => {
			it('should update the claim verifier address', async () => {
				const { claim } = await loadFixture(setup)
				const { admin } = await getSigners()

				// Get the initial verifier address
				const initialVerifier = await claim.claimVerifier()

				// Create a new mock verifier
				const newMockPlonkVerifierFactory = await ethers.getContractFactory('MockPlonkVerifier')
				const newMockPlonkVerifier = await newMockPlonkVerifierFactory.deploy()
				const newVerifierAddress = await newMockPlonkVerifier.getAddress()

				// Update the verifier
				await expect(claim.connect(admin).updateVerifier(newVerifierAddress))
					.to.emit(claim, 'VerifierUpdated')
					.withArgs(newVerifierAddress)

				// Check that the verifier was updated
				const updatedVerifier = await claim.claimVerifier()
				expect(updatedVerifier).to.equal(newVerifierAddress)
				expect(updatedVerifier).to.not.equal(initialVerifier)
			})
		})

		describe('fail', () => {
			it('should revert when called by non-owner', async () => {
				const { claim } = await loadFixture(setup)
				const { user1 } = await getSigners()

				// Create a new mock verifier
				const newMockPlonkVerifierFactory = await ethers.getContractFactory('MockPlonkVerifier')
				const newMockPlonkVerifier = await newMockPlonkVerifierFactory.deploy()
				const newVerifierAddress = await newMockPlonkVerifier.getAddress()

				// Try to update the verifier as non-owner
				await expect(claim.connect(user1).updateVerifier(newVerifierAddress))
					.to.be.revertedWithCustomError(claim, 'OwnableUnauthorizedAccount')
					.withArgs(user1.address)
			})

			it('should revert when trying to set zero address', async () => {
				const { claim } = await loadFixture(setup)
				const { admin } = await getSigners()

				// Try to update the verifier to zero address
				await expect(claim.connect(admin).updateVerifier(ethers.ZeroAddress))
					.to.be.revertedWithCustomError(claim, 'AddressZero')
			})
		})
	})

	describe('submitClaimProof', () => {
		describe('success', () => {
			it('if claims length is 1, emit ContributionRecorded count is 1', async () => {
				const { claim, rollupTestForClaim } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user1)
					.submitClaimProof(claims, claimProofPublicInputs, proof)
				const filter = claim.filters.ContributionRecorded()
				const events = await claim.queryFilter(filter)
				expect(events.length).to.equal(1)
				const event = events[0]
				expect(event.args[0]).to.equal(0)
				expect(event.args[1]).to.equal(claims[0].recipient)
				expect(event.args[2]).to.equal(claims[0].amount)
				expect(event.args[3]).to.equal(1)
			})
			it('if claims length is 2, emit ContributionRecorded count is 2', async () => {
				const { claim, rollupTestForClaim } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])

				const claim2 = { ...claims[0] }
				claim2.nullifier = ethers.hexlify(ethers.randomBytes(32))
				claimProofPublicInputs.lastClaimHash = hashWithPrevHash(
					claim2,
					claimProofPublicInputs.lastClaimHash,
				)
				const newClaims = [claims[0], claim2]
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user1)
					.submitClaimProof(newClaims, claimProofPublicInputs, proof)
				const filter = claim.filters.ContributionRecorded()
				const events = await claim.queryFilter(filter)
				expect(events.length).to.equal(2)
				expect(events[0].args[0]).to.equal(0)
				expect(events[0].args[1]).to.equal(newClaims[0].recipient)
				expect(events[0].args[2]).to.equal(newClaims[0].amount)
				expect(events[0].args[3]).to.equal(1)

				expect(events[1].args[0]).to.equal(0)
				expect(events[1].args[1]).to.equal(newClaims[1].recipient)
				expect(events[1].args[2]).to.equal(newClaims[1].amount)
				expect(events[1].args[3]).to.equal(1)
			})
			it('if same nullifier claims length is 2, emit ContributionRecorded count is 1', async () => {
				const { claim, rollupTestForClaim } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])

				const claim2 = { ...claims[0] }
				claimProofPublicInputs.lastClaimHash = hashWithPrevHash(
					claim2,
					claimProofPublicInputs.lastClaimHash,
				)
				const newClaims = [claims[0], claim2]
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user1)
					.submitClaimProof(newClaims, claimProofPublicInputs, proof)
				const filter = claim.filters.ContributionRecorded()
				const events = await claim.queryFilter(filter)
				expect(events.length).to.equal(1)
				expect(events[0].args[0]).to.equal(0)
				expect(events[0].args[1]).to.equal(newClaims[0].recipient)
				expect(events[0].args[2]).to.equal(newClaims[0].amount)
				expect(events[0].args[3]).to.equal(1)
			})
			it('call recordContribution', async () => {
				const { claim, rollupTestForClaim, contributionTest } =
					await loadFixture(setup)
				const { user1 } = await getSigners()

				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user1)
					.submitClaimProof(claims, claimProofPublicInputs, proof)

				expect(await contributionTest.latestTag()).to.equal(
					ethers.keccak256(ethers.toUtf8Bytes('CLAIM')),
				)
				expect(await contributionTest.latestUser()).to.equal(user1.address)
				expect(await contributionTest.latestAmount()).to.equal(1)
			})
		})
		describe('fail', () => {
			it('revert ClaimChainVerificationFailed', async () => {
				const { claim } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				claimProofPublicInputs.lastClaimHash = ethers.ZeroHash
				await expect(
					claim.submitClaimProof(claims, claimProofPublicInputs, proof),
				).to.be.revertedWithCustomError(claim, 'ClaimChainVerificationFailed')
			})
			it('revert ClaimAggregatorMismatch', async () => {
				const { claim } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				await expect(
					claim.submitClaimProof(claims, claimProofPublicInputs, proof),
				).to.be.revertedWithCustomError(claim, 'ClaimAggregatorMismatch')
			})
			it('revert ClaimProofVerificationFailed', async () => {
				const { claim, mockPlonkVerifier } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				await mockPlonkVerifier.setResult(false)
				await expect(
					claim
						.connect(user1)
						.submitClaimProof(claims, claimProofPublicInputs, proof),
				).to.be.revertedWithCustomError(claim, 'ClaimProofVerificationFailed')
			})
			it('revert BlockHashNotExists', async () => {
				const { claim } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				await expect(
					claim
						.connect(user1)
						.submitClaimProof(claims, claimProofPublicInputs, proof),
				)
					.to.be.revertedWithCustomError(claim, 'BlockHashNotExists')
					.withArgs(claims[0].blockHash)
			})
		})
	})
	describe('relayClaims', () => {
		describe('success', () => {
			it('if users length is 1, emit DirectWithdrawalQueued once', async () => {
				const { claim, rollupTestForClaim } = await loadFixture(setup)
				const { user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user1)
					.submitClaimProof(claims, claimProofPublicInputs, proof)
				await time.increase(60 * 60 * 24)
				await claim.relayClaims(0, [user1.address])
				const filter = claim.filters.DirectWithdrawalQueued()
				const events = await claim.queryFilter(filter)
				expect(events.length).to.equal(1)
				expect(events[0].args[0]).to.match(/^0x[0-9a-fA-F]{64}$/)
				expect(events[0].args[1]).to.equal(user1.address)
				expect(events[0].args[2][0]).to.equal(user1.address)
				expect(events[0].args[2][1]).to.equal(1n)
				expect(events[0].args[2][2]).to.not.equal(0n)
				expect(events[0].args[2][3]).to.match(/^0x[0-9a-fA-F]{64}$/)
			})
			it('send message', async () => {
				const isValidBytes = (value) => {
					return (
						typeof value === 'string' &&
						value.startsWith('0x') &&
						(value.length - 2) % 2 === 0 &&
						/^0x[0-9a-fA-F]*$/.test(value)
					)
				}
				const UINT256_MAX = 2n ** 256n - 1n
				const { claim, scrollMessenger, liquidityAddress } =
					await loadFixture(setup)
				const { deployer } = await getSigners()
				await time.increase(60 * 60 * 24)
				const user = ethers.Wallet.createRandom().address
				await scrollMessenger.clear()
				await claim.relayClaims(0, [user])
				expect(await scrollMessenger.to()).to.equal(liquidityAddress)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(isValidBytes(await scrollMessenger.message())).to.be.true
				expect(await scrollMessenger.gasLimit()).to.equal(UINT256_MAX)
				expect(await scrollMessenger.sender()).to.equal(deployer.address)
				expect(await scrollMessenger.msgValue()).to.equal(0)
			})
			it('execute record contribution', async () => {
				const { claim, contributionTest, rollupTestForClaim } =
					await loadFixture(setup)
				const { deployer, user1 } = await getSigners()
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs([user1.address])
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user1)
					.submitClaimProof(claims, claimProofPublicInputs, proof)
				await time.increase(60 * 60 * 24)
				await claim.relayClaims(0, [user1.address])
				expect(await contributionTest.latestTag()).to.equal(
					ethers.keccak256(ethers.toUtf8Bytes('RELAY_CLAIM')),
				)
				expect(await contributionTest.latestUser()).to.equal(deployer.address)
				expect(await contributionTest.latestAmount()).to.equal(1)
			})
		})
		describe('fail', () => {
			it('revert NotFinishedPeriod', async () => {
				const { claim } = await loadFixture(setup)
				await expect(
					claim.relayClaims(0, [ethers.ZeroAddress]),
				).to.be.revertedWithCustomError(claim, 'NotFinishedPeriod')
			})
		})
	})
	describe('getAllocationInfo', () => {
		it('get allocation info', async () => {
			const { claim } = await loadFixture(setup)
			const user = ethers.Wallet.createRandom().address
			const info = await claim.getAllocationInfo(0, user)
			expect(info[0]).to.equal(0n)
			expect(info[1]).to.equal(46549479166666666666666n)
			expect(info[2]).to.equal(0n)
			expect(info[3]).to.equal(0n)
		})
	})
	describe('getAllocationConstants', () => {
		it('get allocation info', async () => {
			const { claim } = await loadFixture(setup)
			const info = await claim.getAllocationConstants()
			const timestamp = await time.latest()
			const oneHourSeconds = 3600
			const tmp = Math.floor(timestamp / oneHourSeconds) * oneHourSeconds
			expect(info[0]).to.equal(tmp)
			expect(info[1]).to.equal(3600n)
			expect(info[2]).to.equal(1722999120n)
			expect(info[3]).to.equal(8937500000000000000000000n)
			expect(info[4]).to.equal(7n)
			expect(info[5]).to.equal(16n)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const { claim } = await loadFixture(setup)
			const signers = await getSigners()

			const owner = await claim.owner()

			const claim2Factory = await ethers.getContractFactory(
				'Claim2Test',
				signers.admin,
			)
			const next = await upgrades.upgradeProxy(
				await claim.getAddress(),
				claim2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const owner2 = await next.owner()
			expect(owner).to.equal(owner2)
			const val = await next.getVal()
			expect(val).to.equal(88)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const { claim } = await loadFixture(setup)
			const signers = await getSigners()
			const claim2Factory = await ethers.getContractFactory(
				'Claim2Test',
				signers.user1,
			)

			await expect(
				upgrades.upgradeProxy(await claim.getAddress(), claim2Factory, {
					unsafeAllow: ['constructor'],
				}),
			)
				.to.be.revertedWithCustomError(claim, 'OwnableUnauthorizedAccount')
				.withArgs(signers.user1.address)
		})
	})
})
