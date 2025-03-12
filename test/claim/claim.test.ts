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
import { getPrevHashFromClaims, getChainedClaims } from './common.test'

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
		user: HardhatEthersSigner
	}
	const getSigners = async (): Promise<signers> => {
		const [deployer, admin, user] = await ethers.getSigners()
		return {
			deployer,
			admin,
			user,
		}
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
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(claimFactory, 'AddressZero')
			})
		})
	})
	describe('submitClaimProof', () => {
		const generateTestClaimProofPublicInputs = async (claim) => {
			const lastClaimHash = hashWithPrevHash(claim, ethers.ZeroHash)
			const { user } = await getSigners()
			const claimAggregator = user.address
			return { lastClaimHash, claimAggregator }
		}
		const generateTestProof = () => {
			return ethers.hexlify(ethers.randomBytes(64))
		}
		const generateTestClaimsList = () => {
			return [
				{
					recipient: ethers.Wallet.createRandom().address,
					amount: ethers.parseEther('0.1'),
					nullifier: ethers.hexlify(ethers.randomBytes(32)),
					blockHash: ethers.hexlify(ethers.randomBytes(32)),
					blockNumber: 1,
				},
			]
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
		const generateTestArgs = async () => {
			const claims = generateTestClaimsList()
			const claimProofPublicInputs = await generateTestClaimProofPublicInputs(
				claims[0],
			)
			const proof = generateTestProof()
			return { claims, claimProofPublicInputs, proof }
		}
		describe('success', () => {
			it('if claims length is 1, emit ContributionRecorded count is 1', async () => {
				const { claim, rollupTestForClaim } = await loadFixture(setup)
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()
				const { user } = await getSigners()
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user)
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
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()

				const claim２ = { ...claims[0] }
				claim２.nullifier = ethers.hexlify(ethers.randomBytes(32))
				claimProofPublicInputs.lastClaimHash = hashWithPrevHash(
					claim２,
					claimProofPublicInputs.lastClaimHash,
				)
				const newClaims = [claims[0], claim２]
				const { user } = await getSigners()
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user)
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
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()

				const claim２ = { ...claims[0] }
				claimProofPublicInputs.lastClaimHash = hashWithPrevHash(
					claim２,
					claimProofPublicInputs.lastClaimHash,
				)
				const newClaims = [claims[0], claim２]
				const { user } = await getSigners()
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user)
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
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()
				const { user } = await getSigners()
				await rollupTestForClaim.setTestData(
					claims[0].blockNumber,
					claims[0].blockHash,
				)
				await claim
					.connect(user)
					.submitClaimProof(claims, claimProofPublicInputs, proof)

				expect(await contributionTest.latestTag()).to.equal(
					ethers.keccak256(ethers.toUtf8Bytes('CLAIM')),
				)
				expect(await contributionTest.latestUser()).to.equal(user.address)
				expect(await contributionTest.latestAmount()).to.equal(1)
			})
		})
		describe('fail', () => {
			it('revert ClaimChainVerificationFailed', async () => {
				const { claim } = await loadFixture(setup)
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()
				claimProofPublicInputs.lastClaimHash = ethers.ZeroHash
				await expect(
					claim.submitClaimProof(claims, claimProofPublicInputs, proof),
				).to.be.revertedWithCustomError(claim, 'ClaimChainVerificationFailed')
			})
			it('revert ClaimAggregatorMismatch', async () => {
				const { claim } = await loadFixture(setup)
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()
				await expect(
					claim.submitClaimProof(claims, claimProofPublicInputs, proof),
				).to.be.revertedWithCustomError(claim, 'ClaimAggregatorMismatch')
			})
			it('revert ClaimProofVerificationFailed', async () => {
				const { claim, mockPlonkVerifier } = await loadFixture(setup)
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()
				await mockPlonkVerifier.setResult(false)
				const { user } = await getSigners()
				await expect(
					claim
						.connect(user)
						.submitClaimProof(claims, claimProofPublicInputs, proof),
				).to.be.revertedWithCustomError(claim, 'ClaimProofVerificationFailed')
			})
			it('revert BlockHashNotExists', async () => {
				const { claim } = await loadFixture(setup)
				const { claims, claimProofPublicInputs, proof } =
					await generateTestArgs()
				const { user } = await getSigners()
				await expect(
					claim
						.connect(user)
						.submitClaimProof(claims, claimProofPublicInputs, proof),
				)
					.to.be.revertedWithCustomError(claim, 'BlockHashNotExists')
					.withArgs(claims[0].blockHash)
			})
		})

		// it('should accept valid claim proof and queue direct claims', async () => {
		// 	const {
		// 		claim,
		// 		scrollMessenger,
		// 		mockPlonkVerifier,
		// 		rollupTestForClaim,
		// 		liquidityAddress,
		// 	} = await loadFixture(setup)
		// 	const { deployer } = await getSigners()

		// 	// Create claims for direct claim tokens
		// 	const claims = getChainedClaims(2)
		// 	const lastClaimHash = getPrevHashFromClaims(claims)

		// 	const validPublicInputs = {
		// 		lastClaimHash,
		// 		claimAggregator: deployer.address,
		// 	}

		// 	// Set up mock responses
		// 	await mockPlonkVerifier.setResult(true)
		// 	for (const w of claims) {
		// 		await rollupTestForClaim.setTestData(w.blockNumber, w.blockHash)
		// 	}
		// 	await claim.submitClaimProof(claims, validPublicInputs, '0x')

		// 	const allocationPerDay = await claim.getAllocationPerPeriod(0)
		// 	console.log(allocationPerDay.toString())

		// 	await time.increase(60 * 60 * 24)

		// 	const claimer0 = claims[0].recipient

		// 	const allocation0 = await claim.getUserAllocation(0, claimer0)
		// 	console.log(allocation0.toString())

		// 	await claim.relayClaims(0, [claimer0])

		// 	const allocation0After = await claim.getUserAllocation(0, claimer0)
		// 	console.log(allocation0After.toString())
		// })
	})
})
