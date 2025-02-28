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
	describe('submitClaimProof', () => {
		it('should accept valid claim proof and queue direct claims', async () => {
			const {
				claim,
				scrollMessenger,
				mockPlonkVerifier,
				rollupTestForClaim,
				liquidityAddress,
			} = await loadFixture(setup)
			const { deployer } = await getSigners()

			// Create claims for direct claim tokens
			const claims = getChainedClaims(2)
			const lastClaimHash = getPrevHashFromClaims(claims)

			const validPublicInputs = {
				lastClaimHash,
				claimAggregator: deployer.address,
			}

			// Set up mock responses
			await mockPlonkVerifier.setResult(true)
			for (const w of claims) {
				await rollupTestForClaim.setTestData(w.blockNumber, w.blockHash)
			}
			await claim.submitClaimProof(claims, validPublicInputs, '0x')

			const allocationPerDay = await claim.getAllocationPerPeriod(0)
			console.log(allocationPerDay.toString())

			await time.increase(60 * 60 * 24)

			const claimer0 = claims[0].recipient

			const allocation0 = await claim.getUserAllocation(0, claimer0)
			console.log(allocation0.toString())

			await claim.relayClaims(0, [claimer0])

			const allocation0After = await claim.getUserAllocation(0, claimer0)
			console.log(allocation0After.toString())
		})
	})
})
