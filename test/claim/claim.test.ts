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
	})
	describe('relayClaims', () => {
		describe('success', () => {
			it('if users length is 1, emit DirectWithdrawalQueued once', async () => {
				const { claim } = await loadFixture(setup)
				await time.increase(60 * 60 * 24)
				const user = ethers.Wallet.createRandom().address
				await claim.relayClaims(0, [user])
				const filter = claim.filters.DirectWithdrawalQueued()
				const events = await claim.queryFilter(filter)
				expect(events.length).to.equal(1)
				expect(events[0].args[0]).to.match(/^0x[0-9a-fA-F]{64}$/)
				expect(events[0].args[1]).to.equal(user)
				expect(events[0].args[2][0]).to.equal(user)
				expect(events[0].args[2][1]).to.equal(1n)
				expect(events[0].args[2][2]).to.equal(0n)
				expect(events[0].args[2][3]).to.match(/^0x[0-9a-fA-F]{64}$/)
			})
			it('if users length is 2, emit DirectWithdrawalQueued twice', async () => {
				const { claim } = await loadFixture(setup)
				await time.increase(60 * 60 * 24)
				const user1 = ethers.Wallet.createRandom().address
				const user2 = ethers.Wallet.createRandom().address
				await claim.relayClaims(0, [user1, user2])
				const filter = claim.filters.DirectWithdrawalQueued()
				const events = await claim.queryFilter(filter)
				expect(events.length).to.equal(2)
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
				const { claim, contributionTest } = await loadFixture(setup)
				const { deployer } = await getSigners()
				await time.increase(60 * 60 * 24)
				const user = ethers.Wallet.createRandom().address
				await claim.relayClaims(0, [user])
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
			expect(info[0]).to.equal(1741870800n)
			expect(info[1]).to.equal(3600n)
			expect(info[2]).to.equal(1722999120n)
			expect(info[3]).to.equal(8937500000000000000000000n)
			expect(info[4]).to.equal(7n)
			expect(info[5]).to.equal(16n)
		})
	})
})
