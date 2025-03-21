import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import {
	loadFixture,
	time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import {
	Liquidity,
	L1ScrollMessengerTestForLiquidity,
	ContributionTest,
	TestERC20,
	TestNFT,
	TestERC1155,
	WithdrawalLibTest,
	PermitterTest,
} from '../../typechain-types'
import { getDepositHash } from '../common.test'
import { INITIAL_ERC20_TOKEN_ADDRESSES, TokenType } from './common.test'

describe('Liquidity', () => {
	type TestObjects = {
		liquidity: Liquidity
		scrollMessenger: L1ScrollMessengerTestForLiquidity
		rollup: string
		withdrawal: string
		claim: string
		contribution: ContributionTest
		withdrawalLibTest: WithdrawalLibTest
		amlPermitterTest: PermitterTest
		eligibilityPermitterTest: PermitterTest
	}
	async function setup(): Promise<TestObjects> {
		const l1ScrollMessengerFactory = await ethers.getContractFactory(
			'L1ScrollMessengerTestForLiquidity',
		)
		const l1ScrollMessenger = await l1ScrollMessengerFactory.deploy()
		const rollup = ethers.Wallet.createRandom().address
		const withdrawal = ethers.Wallet.createRandom().address
		const claim = ethers.Wallet.createRandom().address
		await l1ScrollMessenger.setXDomainMessageSender(withdrawal)
		const contributionFactory =
			await ethers.getContractFactory('ContributionTest')
		const contribution = await contributionFactory.deploy()
		const withdrawalLibTestFactory =
			await ethers.getContractFactory('WithdrawalLibTest')
		const withdrawalLibTest = await withdrawalLibTestFactory.deploy()

		const permitterTestFactory =
			await ethers.getContractFactory('PermitterTest')
		const amlPermitterTest = await permitterTestFactory.deploy()
		const eligibilityPermitterTest = await permitterTestFactory.deploy()

		const { admin, relayer } = await getSigners()
		const liquidityFactory = await ethers.getContractFactory('Liquidity')
		const liquidity = (await upgrades.deployProxy(
			liquidityFactory,
			[
				admin.address,
				await l1ScrollMessenger.getAddress(),
				rollup,
				withdrawal,
				claim,
				relayer.address,
				await contribution.getAddress(),
				INITIAL_ERC20_TOKEN_ADDRESSES,
			],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as Liquidity
		await liquidity
			.connect(admin)
			.setPermitter(
				await amlPermitterTest.getAddress(),
				await eligibilityPermitterTest.getAddress(),
			)
		await l1ScrollMessenger.setLiquidity(await liquidity.getAddress())
		return {
			liquidity,
			scrollMessenger: l1ScrollMessenger,
			rollup,
			withdrawal,
			claim,
			contribution,
			withdrawalLibTest,
			amlPermitterTest,
			eligibilityPermitterTest,
		}
	}
	type Signers = {
		deployer: HardhatEthersSigner
		admin: HardhatEthersSigner
		relayer: HardhatEthersSigner
		user: HardhatEthersSigner
	}
	const getSigners = async (): Promise<Signers> => {
		const [deployer, admin, relayer, user] = await ethers.getSigners()
		return {
			deployer,
			admin,
			relayer,
			user,
		}
	}
	describe('constructor', () => {
		it('should revert if not initialized through proxy', async () => {
			const liquidityFactory = await ethers.getContractFactory('Liquidity')
			const liquidity =
				(await liquidityFactory.deploy()) as unknown as Liquidity
			await expect(
				liquidity.initialize(
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					ethers.ZeroAddress,
					[ethers.ZeroAddress],
				),
			).to.be.revertedWithCustomError(liquidity, 'InvalidInitialization')
		})
	})
	describe('initialize', () => {
		describe('success', () => {
			it('deployer has admin role', async () => {
				const { liquidity } = await loadFixture(setup)
				const { admin } = await getSigners()
				const role = await liquidity.DEFAULT_ADMIN_ROLE()
				expect(await liquidity.hasRole(role, admin.address)).to.be.true
			})
			it('relayer has relayer role', async () => {
				const { liquidity } = await loadFixture(setup)
				const { relayer } = await getSigners()
				const role = await liquidity.RELAYER()
				expect(await liquidity.hasRole(role, relayer.address)).to.be.true
			})
			it('withdrawal has withdrawal role', async () => {
				const { liquidity, withdrawal } = await loadFixture(setup)
				const role = await liquidity.WITHDRAWAL()
				expect(await liquidity.hasRole(role, withdrawal)).to.be.true
			})
			it('claim has withdrawal role', async () => {
				const { liquidity, claim } = await loadFixture(setup)
				const role = await liquidity.WITHDRAWAL()
				expect(await liquidity.hasRole(role, claim)).to.be.true
			})
		})
		describe('fail', () => {
			it('should revert when initializing twice', async () => {
				const { liquidity } = await loadFixture(setup)

				await expect(
					liquidity.initialize(
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						ethers.ZeroAddress,
						[ethers.ZeroAddress, ethers.ZeroAddress],
					),
				).to.be.revertedWithCustomError(liquidity, 'InvalidInitialization')
			})
			it('admin is zero address', async () => {
				const liquidityFactory = await ethers.getContractFactory('Liquidity')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						liquidityFactory,
						[
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
			it('l1ScrollMessenger is zero address', async () => {
				const liquidityFactory = await ethers.getContractFactory('Liquidity')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						liquidityFactory,
						[
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
			it('rollup is zero address', async () => {
				const liquidityFactory = await ethers.getContractFactory('Liquidity')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						liquidityFactory,
						[
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
			it('withdrawal is zero address', async () => {
				const liquidityFactory = await ethers.getContractFactory('Liquidity')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						liquidityFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
			it('claim is zero address', async () => {
				const liquidityFactory = await ethers.getContractFactory('Liquidity')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						liquidityFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							tmpAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
			it('relayer is zero address', async () => {
				const liquidityFactory = await ethers.getContractFactory('Liquidity')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						liquidityFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							tmpAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
			it('contribution is zero address', async () => {
				const liquidityFactory = await ethers.getContractFactory('Liquidity')
				const tmpAddress = ethers.Wallet.createRandom().address
				await expect(
					upgrades.deployProxy(
						liquidityFactory,
						[
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							tmpAddress,
							ethers.ZeroAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
		})
	})
	describe('pause', () => {
		describe('success', () => {
			it('change pause status', async () => {
				const { liquidity } = await loadFixture(setup)
				expect(await liquidity.paused()).to.be.false
				const { admin } = await getSigners()
				await liquidity.connect(admin).pauseDeposits()
				expect(await liquidity.paused()).to.be.true
				await liquidity.connect(admin).unpauseDeposits()
				expect(await liquidity.paused()).to.be.false
			})
		})
		describe('fail', () => {
			it('only admin(pause)', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				await expect(
					liquidity.connect(user).pauseDeposits(),
				).to.be.revertedWithCustomError(
					liquidity,
					'AccessControlUnauthorizedAccount',
				)
			})
			it('only admin(unpause)', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				await expect(
					liquidity.connect(user).unpauseDeposits(),
				).to.be.revertedWithCustomError(
					liquidity,
					'AccessControlUnauthorizedAccount',
				)
			})
		})
	})

	describe('setPermitter', () => {
		describe('success', () => {
			it('set permitter addresses', async () => {
				const { liquidity } = await loadFixture(setup)
				const nextAmlPermitter = ethers.Wallet.createRandom().address
				const nextEligibilityPermitter = ethers.Wallet.createRandom().address

				let currentAmlPermitter = await liquidity.amlPermitter()
				let currentEligibilityPermitter = await liquidity.eligibilityPermitter()
				expect(currentAmlPermitter).to.be.not.equal(ethers.ZeroAddress)
				expect(currentEligibilityPermitter).to.be.not.equal(ethers.ZeroAddress)

				const { admin } = await getSigners()
				await liquidity
					.connect(admin)
					.setPermitter(nextAmlPermitter, nextEligibilityPermitter)

				currentAmlPermitter = await liquidity.amlPermitter()
				currentEligibilityPermitter = await liquidity.eligibilityPermitter()
				expect(currentAmlPermitter).to.be.equal(nextAmlPermitter)
				expect(currentEligibilityPermitter).to.be.equal(
					nextEligibilityPermitter,
				)
			})
		})
		describe('fail', () => {
			it('only admin(pause)', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				await expect(
					liquidity
						.connect(user)
						.setPermitter(ethers.ZeroAddress, ethers.ZeroAddress),
				).to.be.revertedWithCustomError(
					liquidity,
					'AccessControlUnauthorizedAccount',
				)
			})
		})
	})
	describe('depositNativeToken', () => {
		describe('success', () => {
			it('emit Deposited event', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')

				const currentDepositId = await liquidity.getLastDepositId()
				const currentTimestamp = await ethers.provider.getBlock('latest')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						0, // tokenIndex for ETH should be 0
						depositAmount,
						true,
						currentTimestamp!.timestamp + 1,
					)
			})
			it('transfer eth', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmountEther = '1'
				const depositAmount = ethers.parseEther(depositAmountEther)
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				const initialBalance = await ethers.provider.getBalance(
					await liquidity.getAddress(),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
				const finalBalance = await ethers.provider.getBalance(
					await liquidity.getAddress(),
				)

				expect(finalBalance - initialBalance).to.equal(depositAmount)
			})
			it('amlPermitter is not set', async () => {
				const { liquidity } = await loadFixture(setup)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const tmp = await liquidity.eligibilityPermitter()
				await liquidity.connect(admin).setPermitter(ethers.ZeroAddress, tmp)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
			})
			it('eligibilityPermitter is not set', async () => {
				const { liquidity } = await loadFixture(setup)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const tmp = await liquidity.amlPermitter()
				await liquidity.connect(admin).setPermitter(tmp, ethers.ZeroAddress)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
			})
			it('eligibilityPermission length is 0', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.getBytes('0x')
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
				const filter = liquidity.filters.Deposited()
				const events = await liquidity.queryFilter(filter)
				const isEligible = events[0].args.isEligible
				expect(isEligible).to.be.false
			})
		})

		describe('fail', () => {
			it('revert DepositAmountExceedsLimit', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1000')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						),
				)
					.to.be.revertedWithCustomError(liquidity, 'DepositAmountExceedsLimit')
					.withArgs(depositAmount, ethers.parseEther('100'))
			})
			it('revert DepositHashAlreadyExists', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)

				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						),
				).to.be.revertedWithCustomError(liquidity, 'DepositHashAlreadyExists')
			})
			it('revert TriedToDepositZero', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: 0 },
						),
				).to.be.revertedWithCustomError(liquidity, 'TriedToDepositZero')
			})
			it('pause', async () => {
				const { liquidity } = await loadFixture(setup)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await liquidity.connect(admin).pauseDeposits()
				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						),
				).to.be.revertedWithCustomError(liquidity, 'EnforcedPause')
			})
			it('amlPermitter permit return false', async () => {
				const { liquidity, amlPermitterTest } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await amlPermitterTest.setPermitResult(false)

				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						),
				).to.be.revertedWithCustomError(liquidity, 'AmlValidationFailed')
			})
			it('eligibilityPermitter permit return false', async () => {
				const { liquidity, eligibilityPermitterTest } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await eligibilityPermitterTest.setPermitResult(false)
				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						),
				).to.be.revertedWithCustomError(
					liquidity,
					'EligibilityValidationFailed',
				)
			})
		})
	})
	describe('depositERC20', () => {
		type TestObjectsForDepositERC20 = TestObjects & {
			testERC20: TestERC20
		}
		const setupForDepositERC20 =
			async (): Promise<TestObjectsForDepositERC20> => {
				const testObjects = await loadFixture(setup)
				const { user } = await getSigners()

				const testERC20Factory = await ethers.getContractFactory('TestERC20')
				const testERC20 = await testERC20Factory.deploy(user.address)
				return {
					...testObjects,
					testERC20,
				}
			}
		describe('success', () => {
			it('emit Deposited event', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('0.000000001')

				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				const currentDepositId = await liquidity.getLastDepositId()
				const currentTimestamp = await ethers.provider.getBlock('latest')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						3, // new token index
						depositAmount,
						true,
						currentTimestamp!.timestamp + 1,
					)
			})
			it('transfer ERC20', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('0.00000001')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				const erc20Address = await testERC20.getAddress()

				await expect(() =>
					liquidity
						.connect(user)
						.depositERC20(
							erc20Address,
							recipientSaltHash,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.changeTokenBalances(
					testERC20,
					[user, liquidity],
					[-depositAmount, depositAmount],
				)
			})
			it('amlPermitter is not set', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('0.00000001')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				const erc20Address = await testERC20.getAddress()
				const tmp = await liquidity.eligibilityPermitter()
				await liquidity.connect(admin).setPermitter(ethers.ZeroAddress, tmp)
				await liquidity
					.connect(user)
					.depositERC20(
						erc20Address,
						recipientSaltHash,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)
			})
			it('eligibilityPermitter is not set', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('0.00000001')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				const erc20Address = await testERC20.getAddress()
				const tmp = await liquidity.amlPermitter()
				await liquidity.connect(admin).setPermitter(tmp, ethers.ZeroAddress)
				await liquidity
					.connect(user)
					.depositERC20(
						erc20Address,
						recipientSaltHash,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)
			})
			it('eligibilityPermitter is not set', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('0.00000001')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.getBytes('0x')
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				const erc20Address = await testERC20.getAddress()
				await liquidity
					.connect(user)
					.depositERC20(
						erc20Address,
						recipientSaltHash,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)
				const filter = liquidity.filters.Deposited()
				const events = await liquidity.queryFilter(filter)
				const isEligible = events[0].args.isEligible
				expect(isEligible).to.be.false
			})
		})

		describe('fail', () => {
			it('fail DepositAmountExceedsLimit', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				)
					.to.be.revertedWithCustomError(liquidity, 'DepositAmountExceedsLimit')
					.withArgs(depositAmount, '500000000000')
			})
			it('revert DepositHashAlreadyExists', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('0.00000001')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), 2n * depositAmount)
				await liquidity
					.connect(user)
					.depositERC20(
						await testERC20.getAddress(),
						recipientSaltHash,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)

				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'DepositHashAlreadyExists')
			})
			it('revert TriedToDepositZero', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							0,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'TriedToDepositZero')
			})
			it('pause', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await liquidity.connect(admin).pauseDeposits()
				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							0,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'EnforcedPause')
			})
			it('amlPermitter permit return false', async () => {
				const { liquidity, testERC20, amlPermitterTest } =
					await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const depositAmount = ethers.parseEther('1')
				await amlPermitterTest.setPermitResult(false)
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)
				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'AmlValidationFailed')
			})
			it('eligibilityPermitter permit return false', async () => {
				const { liquidity, testERC20, eligibilityPermitterTest } =
					await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const depositAmount = ethers.parseEther('1')
				await eligibilityPermitterTest.setPermitResult(false)
				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)
				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(
					liquidity,
					'EligibilityValidationFailed',
				)
			})
		})
	})
	describe('depositERC721', () => {
		type TestObjectsForDepositERC721 = TestObjects & {
			testNFT: TestNFT
		}
		const setupForDepositERC721 =
			async (): Promise<TestObjectsForDepositERC721> => {
				const testObjects = await loadFixture(setup)
				const { user } = await getSigners()

				const testNFTFactory = await ethers.getContractFactory('TestNFT')
				const testNFT = await testNFTFactory.connect(user).deploy()
				return {
					...testObjects,
					testNFT,
				}
			}
		describe('success', () => {
			it('emit Deposited event', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				const currentDepositId = await liquidity.getLastDepositId()
				const currentTimestamp = await ethers.provider.getBlock('latest')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await expect(
					liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
							amlPermission,
							eligibilityPermission,
						),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						3, // new token index
						1, // amount is always 1 for ERC721
						true,
						currentTimestamp!.timestamp + 1,
					)
			})
			it('transfer NFT', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				expect(await testNFT.ownerOf(tokenId)).to.equal(user.address)

				await liquidity
					.connect(user)
					.depositERC721(
						await testNFT.getAddress(),
						recipientSaltHash,
						tokenId,
						amlPermission,
						eligibilityPermission,
					)

				expect(await testNFT.ownerOf(tokenId)).to.equal(
					await liquidity.getAddress(),
				)
			})
			it('amlPermitter is not set', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const tmp = await liquidity.eligibilityPermitter()
				await liquidity.connect(admin).setPermitter(ethers.ZeroAddress, tmp)
				await liquidity
					.connect(user)
					.depositERC721(
						await testNFT.getAddress(),
						recipientSaltHash,
						tokenId,
						amlPermission,
						eligibilityPermission,
					)
			})
			it('eligibilityPermitter is not set', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const tmp = await liquidity.amlPermitter()
				await liquidity.connect(admin).setPermitter(tmp, ethers.ZeroAddress)
				await liquidity
					.connect(user)
					.depositERC721(
						await testNFT.getAddress(),
						recipientSaltHash,
						tokenId,
						amlPermission,
						eligibilityPermission,
					)
			})
			it('eligibilityPermitter is not set', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.getBytes('0x')

				await liquidity
					.connect(user)
					.depositERC721(
						await testNFT.getAddress(),
						recipientSaltHash,
						tokenId,
						amlPermission,
						eligibilityPermission,
					)
				const filter = liquidity.filters.Deposited()
				const events = await liquidity.queryFilter(filter)
				const isEligible = events[0].args.isEligible
				expect(isEligible).to.be.false
			})
		})
		describe('fail', () => {
			it('revert DepositHashAlreadyExists', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0
				const isEligible = true
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				expect(await testNFT.ownerOf(tokenId)).to.equal(user.address)

				await liquidity
					.connect(user)
					.depositERC721(
						await testNFT.getAddress(),
						recipientSaltHash,
						tokenId,
						amlPermission,
						eligibilityPermission,
					)
				const filter = liquidity.filters.Deposited()
				const events = await liquidity.queryFilter(filter)
				const depositId = events[0].args.depositId
				const tokenIndex = events[0].args.tokenIndex

				await liquidity.connect(user).cancelDeposit(depositId, {
					depositor: user.address,
					recipientSaltHash,
					tokenIndex: tokenIndex,
					amount: 1,
					isEligible,
				})
				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				await expect(
					liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'DepositHashAlreadyExists')
			})
			it('pause', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0
				const isEligible = true
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				expect(await testNFT.ownerOf(tokenId)).to.equal(user.address)

				await liquidity
					.connect(user)
					.depositERC721(
						await testNFT.getAddress(),
						recipientSaltHash,
						tokenId,
						amlPermission,
						eligibilityPermission,
					)
				const filter = liquidity.filters.Deposited()
				const events = await liquidity.queryFilter(filter)
				const depositId = events[0].args.depositId
				const tokenIndex = events[0].args.tokenIndex

				await liquidity.connect(user).cancelDeposit(depositId, {
					depositor: user.address,
					recipientSaltHash,
					tokenIndex: tokenIndex,
					amount: 1,
					isEligible,
				})
				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				await liquidity.connect(admin).pauseDeposits()
				await expect(
					liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'EnforcedPause')
			})
			it('amlPermitter permit return false', async () => {
				const { liquidity, testNFT, amlPermitterTest } = await loadFixture(
					setupForDepositERC721,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await amlPermitterTest.setPermitResult(false)

				await expect(
					liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'AmlValidationFailed')
			})
			it('eligibilityPermitter permit return false', async () => {
				const { liquidity, testNFT, eligibilityPermitterTest } =
					await loadFixture(setupForDepositERC721)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await eligibilityPermitterTest.setPermitResult(false)

				await expect(
					liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(
					liquidity,
					'EligibilityValidationFailed',
				)
			})
		})
	})
	describe('depositERC1155', () => {
		type TestObjectsForDepositERC1155 = TestObjects & {
			testERC1155: TestERC1155
		}
		const setupForDepositERC1155 =
			async (): Promise<TestObjectsForDepositERC1155> => {
				const testObjects = await loadFixture(setup)
				const { user } = await getSigners()

				const test1155Factory = await ethers.getContractFactory('TestERC1155')
				const testERC1155 = await test1155Factory.connect(user).deploy()
				const tokenId = 1
				const amount = 100
				await testERC1155.mint(user.address, tokenId, amount, '0x')

				return {
					...testObjects,
					testERC1155,
				}
			}
		describe('success', () => {
			it('emit Deposited event', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				const currentDepositId = await liquidity.getLastDepositId()
				const currentTimestamp = await ethers.provider.getBlock('latest')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						3, // new token index for the first ERC1155
						depositAmount,
						true,
						currentTimestamp!.timestamp + 1,
					)
			})
			it('transfer ERC1155', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				const userInitialBalance = await testERC1155.balanceOf(
					user.address,
					tokenId,
				)
				const liquidityInitialBalance = await testERC1155.balanceOf(
					await liquidity.getAddress(),
					tokenId,
				)

				await liquidity
					.connect(user)
					.depositERC1155(
						await testERC1155.getAddress(),
						recipientSaltHash,
						tokenId,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)

				const userFinalBalance = await testERC1155.balanceOf(
					user.address,
					tokenId,
				)
				const liquidityFinalBalance = await testERC1155.balanceOf(
					await liquidity.getAddress(),
					tokenId,
				)

				expect(userFinalBalance).to.equal(
					userInitialBalance - BigInt(depositAmount),
				)
				expect(liquidityFinalBalance).to.equal(
					liquidityInitialBalance + BigInt(depositAmount),
				)
			})
			it('amlPermitter is not set', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const tmp = await liquidity.eligibilityPermitter()
				await liquidity.connect(admin).setPermitter(ethers.ZeroAddress, tmp)
				await liquidity
					.connect(user)
					.depositERC1155(
						await testERC1155.getAddress(),
						recipientSaltHash,
						tokenId,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)
			})
			it('eligibilityPermitter is not set', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				const tmp = await liquidity.amlPermitter()
				await liquidity.connect(admin).setPermitter(tmp, ethers.ZeroAddress)
				await liquidity
					.connect(user)
					.depositERC1155(
						await testERC1155.getAddress(),
						recipientSaltHash,
						tokenId,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)
			})
			it('eligibilityPermission length is 0', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.getBytes('0x')
				await liquidity
					.connect(user)
					.depositERC1155(
						await testERC1155.getAddress(),
						recipientSaltHash,
						tokenId,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)
				const filter = liquidity.filters.Deposited()
				const events = await liquidity.queryFilter(filter)
				const isEligible = events[0].args.isEligible
				expect(isEligible).to.be.false
			})
		})
		describe('fail', () => {
			it('revert DepositHashAlreadyExists', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				await liquidity
					.connect(user)
					.depositERC1155(
						await testERC1155.getAddress(),
						recipientSaltHash,
						tokenId,
						depositAmount,
						amlPermission,
						eligibilityPermission,
					)

				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'DepositHashAlreadyExists')
			})
			it('revert TriedToDepositZero', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 0
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'TriedToDepositZero')
			})
			it('pause', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { admin, user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 0
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)
				await liquidity.connect(admin).pauseDeposits()
				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'EnforcedPause')
			})
			it('amlPermitter permit return false', async () => {
				const { liquidity, testERC1155, amlPermitterTest } = await loadFixture(
					setupForDepositERC1155,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await amlPermitterTest.setPermitResult(false)

				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(liquidity, 'AmlValidationFailed')
			})
			it('eligibilityPermitter permit return false', async () => {
				const { liquidity, testERC1155, eligibilityPermitterTest } =
					await loadFixture(setupForDepositERC1155)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 50

				await testERC1155
					.connect(user)
					.setApprovalForAll(await liquidity.getAddress(), true)

				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
				await eligibilityPermitterTest.setPermitResult(false)

				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						),
				).to.be.revertedWithCustomError(
					liquidity,
					'EligibilityValidationFailed',
				)
			})
		})
	})
	describe('relayDeposits', () => {
		describe('success', () => {
			it('send scroll messenger', async () => {
				const { liquidity, scrollMessenger, rollup } = await loadFixture(setup)
				const { relayer, user } = await getSigners()

				// Create some deposits using ETH
				const depositAmount = ethers.parseEther('1')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				for (let i = 0; i < 5; i++) {
					const recipientSaltHash = ethers.keccak256(
						ethers.toUtf8Bytes(`test${i}`),
					)
					await liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						)
				}

				const upToDepositId = 5
				const gasLimit = 1000000

				await liquidity
					.connect(relayer)
					.relayDeposits(upToDepositId, gasLimit, {
						value: ethers.parseEther('1'),
					})

				expect(await scrollMessenger.to()).to.equal(rollup)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.gasLimit()).to.equal(gasLimit)
				expect(await scrollMessenger.sender()).to.equal(relayer.address)
				expect(await scrollMessenger.msgValue()).to.equal(
					ethers.parseEther('1'),
				)

				const depositHash0 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test0')),
					depositAmount,
					0,
					true,
				)

				const depositHash1 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test1')),
					depositAmount,
					0,
					true,
				)

				const depositHash2 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test2')),
					depositAmount,
					0,
					true,
				)

				const depositHash3 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test3')),
					depositAmount,
					0,
					true,
				)

				const depositHash4 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test4')),
					depositAmount,
					0,
					true,
				)

				const funcSelector = ethers
					.id('processDeposits(uint256,bytes32[])')
					.slice(0, 10)

				const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
					['uint256', 'bytes32[]'],
					[
						upToDepositId,
						[
							depositHash0,
							depositHash1,
							depositHash2,
							depositHash3,
							depositHash4,
						],
					],
				)
				const encodedData = funcSelector + encodedParams.slice(2)
				expect(await scrollMessenger.message()).to.equal(encodedData)
			})
			it('emit DepositsRelayed event', async () => {
				const { liquidity } = await loadFixture(setup)
				const { relayer, user } = await getSigners()

				// Create some deposits using ETH
				const depositAmount = ethers.parseEther('1')
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				for (let i = 0; i < 5; i++) {
					const recipientSaltHash = ethers.keccak256(
						ethers.toUtf8Bytes(`test${i}`),
					)
					await liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						)
				}

				const upToDepositId = 5
				const gasLimit = 1000000

				const depositHash0 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test0')),
					depositAmount,
					0,
					true,
				)
				const depositHash1 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test1')),
					depositAmount,
					0,
					true,
				)
				const depositHash2 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test2')),
					depositAmount,
					0,
					true,
				)
				const depositHash3 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test3')),
					depositAmount,
					0,
					true,
				)
				const depositHash4 = getDepositHash(
					user.address,
					ethers.keccak256(ethers.toUtf8Bytes('test4')),
					depositAmount,
					0,
					true,
				)

				const funcSelector = ethers
					.id('processDeposits(uint256,bytes32[])')
					.slice(0, 10)

				const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
					['uint256', 'bytes32[]'],
					[
						upToDepositId,
						[
							depositHash0,
							depositHash1,
							depositHash2,
							depositHash3,
							depositHash4,
						],
					],
				)
				const expectedEncodedData = funcSelector + encodedParams.slice(2)

				await expect(
					liquidity.connect(relayer).relayDeposits(upToDepositId, gasLimit, {
						value: ethers.parseEther('1'),
					}),
				)
					.to.emit(liquidity, 'DepositsRelayed')
					.withArgs(upToDepositId, gasLimit, expectedEncodedData)
			})
		})
		describe('fail', () => {
			it('only relayer', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const upToDepositId = 5
				const gasLimit = 1000000

				await expect(
					liquidity.connect(user).relayDeposits(upToDepositId, gasLimit),
				)
					.to.be.revertedWithCustomError(
						liquidity,
						'AccessControlUnauthorizedAccount',
					)
					.withArgs(user.address, await liquidity.RELAYER())
			})
		})
	})
	describe('cancelDeposit', () => {
		type TestObjectsForDepositERC20 = TestObjects & {
			depositAmount: bigint
			recipientSaltHash: string
			depositId: bigint
		}
		const setupCancelDeposit =
			async (): Promise<TestObjectsForDepositERC20> => {
				const testObjects = await loadFixture(setup)
				const { user } = await getSigners()
				const depositAmount = ethers.parseEther('1')
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await testObjects.liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
				const depositId = await testObjects.liquidity.getLastDepositId()
				return {
					...testObjects,
					depositAmount,
					recipientSaltHash,
					depositId,
				}
			}
		describe('success', () => {
			describe('send token', () => {
				it('native token', async () => {
					const { liquidity, depositAmount, recipientSaltHash, depositId } =
						await loadFixture(setupCancelDeposit)
					const { user } = await getSigners()
					const initialBalance = await ethers.provider.getBalance(user.address)

					const tx = await liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
						isEligible: true,
					})
					const receipt = await tx.wait()
					const gasCost = receipt!.gasUsed * receipt!.gasPrice

					const finalBalance = await ethers.provider.getBalance(user.address)
					expect(finalBalance - initialBalance + gasCost).to.equal(
						depositAmount,
					)
				})
				it('erc20', async () => {
					const { liquidity } = await loadFixture(setup)
					const { user } = await getSigners()

					const testERC20Factory = await ethers.getContractFactory('TestERC20')
					const testERC20 = await testERC20Factory.deploy(user.address)

					const depositAmount = ethers.parseEther('0.00000001')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					await testERC20
						.connect(user)
						.approve(await liquidity.getAddress(), depositAmount)
					await liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
							amlPermission,
							eligibilityPermission,
						)

					const depositId = await liquidity.getLastDepositId()

					// Check balances before cancellation
					const initialUserBalance = await testERC20.balanceOf(user.address)
					const initialLiquidityBalance = await testERC20.balanceOf(
						await liquidity.getAddress(),
					)

					await liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash,
						tokenIndex: 3, // Assuming 1 is the index for the first ERC20 token
						amount: depositAmount,
						isEligible: true,
					})

					// Check balances after cancellation
					const finalUserBalance = await testERC20.balanceOf(user.address)
					const finalLiquidityBalance = await testERC20.balanceOf(
						await liquidity.getAddress(),
					)

					// Verify balance changes
					expect(finalUserBalance - initialUserBalance).to.equal(depositAmount)
					expect(initialLiquidityBalance - finalLiquidityBalance).to.equal(
						depositAmount,
					)
				})
				it('erc721', async () => {
					const { liquidity } = await loadFixture(setup)
					const { deployer, user } = await getSigners()

					const testNFTFactory = await ethers.getContractFactory('TestNFT')
					const testNFT = await testNFTFactory.deploy()

					const tokenId = 1
					await testNFT.transferFrom(deployer.address, user.address, tokenId)
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					await testNFT
						.connect(user)
						.approve(await liquidity.getAddress(), tokenId)
					await liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
							amlPermission,
							eligibilityPermission,
						)

					const depositId = await liquidity.getLastDepositId()

					await liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash,
						tokenIndex: 3,
						amount: 1,
						isEligible: true,
					})

					expect(await testNFT.ownerOf(tokenId)).to.equal(user.address)
				})
				it('erc1155', async () => {
					const { liquidity } = await loadFixture(setup)
					const { user } = await getSigners()

					const testERC1155Factory =
						await ethers.getContractFactory('TestERC1155')
					const testERC1155 = await testERC1155Factory.deploy()

					const tokenId = 1
					const amount = 100
					await testERC1155.mint(user.address, tokenId, amount, '0x')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					await testERC1155
						.connect(user)
						.setApprovalForAll(await liquidity.getAddress(), true)
					await liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							amount,
							amlPermission,
							eligibilityPermission,
						)

					const depositId = await liquidity.getLastDepositId()
					const initialBalance = await testERC1155.balanceOf(
						user.address,
						tokenId,
					)

					await liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash,
						tokenIndex: 3, // Assuming 3 is the index for the first ERC1155 token
						amount: amount,
						isEligible: true,
					})

					const finalBalance = await testERC1155.balanceOf(
						user.address,
						tokenId,
					)
					expect(finalBalance - initialBalance).to.equal(amount)
				})
			})
			it('emit DepositCanceled event', async () => {
				const { liquidity, depositAmount, recipientSaltHash, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user } = await getSigners()

				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
						isEligible: true,
					}),
				)
					.to.emit(liquidity, 'DepositCanceled')
					.withArgs(depositId)
			})
			it('can deposit not amount', async () => {
				const { liquidity, depositAmount, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user, relayer } = await getSigners()

				await liquidity.connect(relayer).relayDeposits(depositId, 1000000, {
					value: ethers.parseEther('1'),
				})

				const recipientSaltHash2 = ethers.keccak256(ethers.toUtf8Bytes('test2'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash2,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
				const nextDepositId = depositId + 1n
				await expect(
					liquidity.connect(user).cancelDeposit(nextDepositId, {
						depositor: user.address,
						recipientSaltHash: recipientSaltHash2,
						tokenIndex: 0,
						amount: depositAmount,
						isEligible: true,
					}),
				)
					.to.emit(liquidity, 'DepositCanceled')
					.withArgs(nextDepositId)
			})
		})
		describe('fail', () => {
			it('revert OnlySenderCanCancelDeposit', async () => {
				const { liquidity, depositAmount, recipientSaltHash, depositId } =
					await loadFixture(setupCancelDeposit)
				const { relayer } = await getSigners()

				await expect(
					liquidity.connect(relayer).cancelDeposit(depositId, {
						depositor: relayer.address,
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
						isEligible: true,
					}),
				).to.be.revertedWithCustomError(liquidity, 'OnlySenderCanCancelDeposit')
			})
			it('revert InvalidDepositHash', async () => {
				const { liquidity, depositAmount, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user } = await getSigners()

				const wrongHash = ethers.keccak256(ethers.toUtf8Bytes('wrong'))
				const depositData = await liquidity.getDepositData(depositId)
				const wrongDepositHash = getDepositHash(
					user.address,
					wrongHash,
					depositAmount,
					0,
					true,
				)

				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash: wrongHash,
						tokenIndex: 0,
						amount: depositAmount,
						isEligible: true,
					}),
				)
					.to.be.revertedWithCustomError(liquidity, 'InvalidDepositHash')
					.withArgs(depositData.depositHash, wrongDepositHash)
			})
			it('rejects duplicate cancel deposit', async () => {
				const { liquidity, depositAmount, recipientSaltHash, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user } = await getSigners()

				await liquidity.connect(user).cancelDeposit(depositId, {
					depositor: user.address,
					recipientSaltHash,
					tokenIndex: 0,
					amount: depositAmount,
					isEligible: true,
				})

				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
						isEligible: true,
					}),
				).to.be.revertedWithCustomError(liquidity, 'OnlySenderCanCancelDeposit')
			})
			it('cannot not rejected deposit', async () => {
				const { liquidity, depositAmount, recipientSaltHash, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user, relayer } = await getSigners()
				await liquidity.connect(relayer).relayDeposits(depositId, 1000000, {
					value: ethers.parseEther('1'),
				})
				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						depositor: user.address,
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
						isEligible: true,
					}),
				).to.be.revertedWithCustomError(liquidity, 'AlreadyRelayed')
			})

			it.skip('reentrancy attack', async () => {
				// payable(recipient).transfer(amount);
				// The gas consumption is limited to 2500 because the transfer function is performed.
				// Therefore, reentrancy attacks that execute complex logic are not possible.
			})
		})
	})
	describe('processWithdrawals', () => {
		describe('success', () => {
			describe('DirectWithdrawals', () => {
				describe('send token', () => {
					it('native token', async () => {
						const { liquidity, scrollMessenger, withdrawalLibTest } =
							await loadFixture(setup)
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)
						const depositAmount = ethers.parseEther('1')
						const amlPermission = ethers.toUtf8Bytes('AML')
						const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
						await liquidity.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{
								value: depositAmount,
							},
						)
						const initialBalance = await ethers.provider.getBalance(
							await liquidity.getAddress(),
						)
						const testWithdrawal = {
							recipient: ethers.Wallet.createRandom().address,
							tokenIndex: 0,
							amount: depositAmount,
							nullifier: ethers.encodeBytes32String('test'),
						}
						const withdrawalHash = await withdrawalLibTest.getHash(
							testWithdrawal.recipient,
							testWithdrawal.tokenIndex,
							testWithdrawal.amount,
							testWithdrawal.nullifier,
						)
						await expect(
							scrollMessenger.processWithdrawals(
								[
									{
										recipient: testWithdrawal.recipient,
										tokenIndex: testWithdrawal.tokenIndex,
										amount: testWithdrawal.amount,
										nullifier: testWithdrawal.nullifier,
									},
								],
								[],
							),
						)
							.to.emit(liquidity, 'DirectWithdrawalSuccessed')
							.withArgs(withdrawalHash, testWithdrawal.recipient)
						const finalBalance = await ethers.provider.getBalance(
							await liquidity.getAddress(),
						)
						expect(initialBalance - finalBalance).to.equal(depositAmount)
					})
					it('erc20', async () => {
						const { liquidity, scrollMessenger, withdrawalLibTest } =
							await loadFixture(setup)
						const { user } = await getSigners()
						const testERC20Factory =
							await ethers.getContractFactory('TestERC20')
						const testERC20 = await testERC20Factory.deploy(user.address)
						const depositAmount = ethers.parseEther('0.000000001')
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)
						const amlPermission = ethers.toUtf8Bytes('AML')
						const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')
						await testERC20
							.connect(user)
							.approve(await liquidity.getAddress(), depositAmount)
						await liquidity
							.connect(user)
							.depositERC20(
								testERC20.getAddress(),
								recipientSaltHash,
								depositAmount,
								amlPermission,
								eligibilityPermission,
							)

						const recipient = ethers.Wallet.createRandom().address
						const [, tokenIndex] = await liquidity.getTokenIndex(
							TokenType.ERC20,
							testERC20.getAddress(),
							0,
						)
						const testWithdrawal = {
							recipient: recipient,
							tokenIndex: tokenIndex,
							amount: depositAmount,
							nullifier: ethers.encodeBytes32String('test'),
						}
						const beforeBalance = await testERC20.balanceOf(recipient)
						const withdrawalHash = await withdrawalLibTest.getHash(
							testWithdrawal.recipient,
							testWithdrawal.tokenIndex,
							testWithdrawal.amount,
							testWithdrawal.nullifier,
						)
						await expect(
							scrollMessenger.processWithdrawals(
								[
									{
										recipient: testWithdrawal.recipient,
										tokenIndex: testWithdrawal.tokenIndex,
										amount: testWithdrawal.amount,
										nullifier: testWithdrawal.nullifier,
									},
								],
								[],
							),
						)
							.to.emit(liquidity, 'DirectWithdrawalSuccessed')
							.withArgs(withdrawalHash, testWithdrawal.recipient)
						const afterBalance = await testERC20.balanceOf(recipient)
						expect(afterBalance - beforeBalance).to.equal(depositAmount)
					})
					it.skip('erc721', async () => {
						// not supported
					})
					it.skip('erc1155', async () => {
						// not supported
					})
				})
				describe('not send token', () => {
					it('native token', async () => {
						const { liquidity, scrollMessenger, withdrawalLibTest } =
							await loadFixture(setup)
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)
						const depositAmount = ethers.parseEther('1')
						const amlPermission = ethers.toUtf8Bytes('AML')
						const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

						await liquidity.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{
								value: depositAmount,
							},
						)
						const recipient = ethers.Wallet.createRandom().address
						const tokenIndex = 0
						const testDepositAmount = depositAmount + 1n
						const testNullifier = ethers.encodeBytes32String('test')

						const withdrawalHash = await withdrawalLibTest.getHash(
							recipient,
							tokenIndex,
							testDepositAmount,
							testNullifier,
						)

						const beforeTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(beforeTimestamp).to.equal(0)
						const testWithdrawal = {
							recipient,
							tokenIndex,
							amount: testDepositAmount,
							nullifier: testNullifier,
						}

						await expect(
							scrollMessenger.processWithdrawals([testWithdrawal], []),
						)
							.to.emit(liquidity, 'WithdrawalClaimable')
							.withArgs(withdrawalHash)
							.to.emit(liquidity, 'DirectWithdrawalFailed')
							.withArgs(withdrawalHash, [
								testWithdrawal.recipient,
								testWithdrawal.tokenIndex,
								testWithdrawal.amount,
								testWithdrawal.nullifier,
							])
						const afterTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(afterTimestamp).to.equal(await time.latest())
					})
					it('erc20', async () => {
						const { liquidity, scrollMessenger, withdrawalLibTest } =
							await loadFixture(setup)
						const { user } = await getSigners()
						const testERC20Factory =
							await ethers.getContractFactory('TestERC20')
						const testERC20 = await testERC20Factory.deploy(user.address)
						const depositAmount = ethers.parseEther('0.000000001')
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)
						const amlPermission = ethers.toUtf8Bytes('AML')
						const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

						await testERC20
							.connect(user)
							.approve(await liquidity.getAddress(), depositAmount)
						await liquidity
							.connect(user)
							.depositERC20(
								testERC20.getAddress(),
								recipientSaltHash,
								depositAmount,
								amlPermission,
								eligibilityPermission,
							)

						const recipient = ethers.Wallet.createRandom().address
						const [, tokenIndex] = await liquidity.getTokenIndex(
							TokenType.ERC20,
							testERC20.getAddress(),
							0,
						)
						const testDepositAmount = depositAmount + 1n
						const testNullifier = ethers.encodeBytes32String('test')
						const withdrawalHash = await withdrawalLibTest.getHash(
							recipient,
							tokenIndex,
							testDepositAmount,
							testNullifier,
						)
						const testWithdrawal = {
							recipient,
							tokenIndex,
							amount: testDepositAmount,
							nullifier: testNullifier,
						}
						const beforeTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(beforeTimestamp).to.equal(0)
						await expect(
							scrollMessenger.processWithdrawals([testWithdrawal], []),
						)
							.to.emit(liquidity, 'WithdrawalClaimable')
							.withArgs(withdrawalHash)
							.to.emit(liquidity, 'DirectWithdrawalFailed')
							.withArgs(withdrawalHash, [
								testWithdrawal.recipient,
								testWithdrawal.tokenIndex,
								testWithdrawal.amount,
								testWithdrawal.nullifier,
							])
						const afterTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(afterTimestamp).to.equal(await time.latest())
					})
					it('erc721', async () => {
						const { liquidity, scrollMessenger, withdrawalLibTest } =
							await loadFixture(setup)
						const { user } = await getSigners()
						const testNFTFactory = await ethers.getContractFactory(
							'TestNFT',
							user,
						)
						const testNFT = await testNFTFactory.deploy()
						const tokenId = 0
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)
						const amlPermission = ethers.toUtf8Bytes('AML')
						const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

						await testNFT
							.connect(user)
							.approve(await liquidity.getAddress(), tokenId)
						await liquidity
							.connect(user)
							.depositERC721(
								testNFT.getAddress(),
								recipientSaltHash,
								tokenId,
								amlPermission,
								eligibilityPermission,
							)

						const recipient = ethers.ZeroAddress
						const [, tokenIndex] = await liquidity.getTokenIndex(
							TokenType.ERC721,
							testNFT.getAddress(),
							tokenId,
						)
						const testNullifier = ethers.encodeBytes32String('test')
						const testAmount = 1
						const withdrawalHash = await withdrawalLibTest.getHash(
							recipient,
							tokenIndex,
							testAmount,
							testNullifier,
						)

						const beforeTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(beforeTimestamp).to.equal(0)

						await expect(
							scrollMessenger.processWithdrawals(
								[
									{
										recipient,
										tokenIndex,
										amount: testAmount,
										nullifier: testNullifier,
									},
								],
								[],
							),
						)
							.to.emit(liquidity, 'WithdrawalClaimable')
							.withArgs(withdrawalHash)
							.to.emit(liquidity, 'DirectWithdrawalFailed')
							.withArgs(withdrawalHash, [
								recipient,
								tokenIndex,
								testAmount,
								testNullifier,
							])
						const afterTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(afterTimestamp).to.equal(await time.latest())
					})
					it('erc1155', async () => {
						const { liquidity, scrollMessenger, withdrawalLibTest } =
							await loadFixture(setup)
						const { user } = await getSigners()
						const testERC1155Factory = await ethers.getContractFactory(
							'TestERC1155',
							user,
						)
						const testERC1155 = await testERC1155Factory.deploy()
						const tokenId = 1
						const amount = 100
						const testAmount = amount + 1
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)
						const amlPermission = ethers.toUtf8Bytes('AML')
						const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

						await testERC1155.mint(user.address, tokenId, amount, '0x')
						await testERC1155
							.connect(user)
							.setApprovalForAll(await liquidity.getAddress(), true)
						await liquidity
							.connect(user)
							.depositERC1155(
								testERC1155.getAddress(),
								recipientSaltHash,
								tokenId,
								amount,
								amlPermission,
								eligibilityPermission,
							)

						const recipient = ethers.ZeroAddress
						const [, tokenIndex] = await liquidity.getTokenIndex(
							TokenType.ERC1155,
							testERC1155.getAddress(),
							tokenId,
						)
						const testNullifier = ethers.encodeBytes32String('test')

						const withdrawalHash = await withdrawalLibTest.getHash(
							recipient,
							tokenIndex,
							testAmount,
							testNullifier,
						)

						const beforeTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(beforeTimestamp).to.equal(0)

						await expect(
							scrollMessenger.processWithdrawals(
								[
									{
										recipient,
										tokenIndex,
										amount: testAmount,
										nullifier: testNullifier,
									},
								],
								[],
							),
						)
							.to.emit(liquidity, 'WithdrawalClaimable')
							.withArgs(withdrawalHash)
							.to.emit(liquidity, 'DirectWithdrawalFailed')
							.withArgs(withdrawalHash, [
								recipient,
								tokenIndex,
								testAmount,
								testNullifier,
							])
						const afterTimestamp =
							await liquidity.claimableWithdrawals(withdrawalHash)
						expect(afterTimestamp).to.equal(await time.latest())
					})
				})
				it('call recordContribution', async () => {
					const { liquidity, scrollMessenger, contribution } =
						await loadFixture(setup)
					const { deployer, user } = await getSigners()

					// Setup a deposit to ensure there's something to withdraw
					const depositAmount = ethers.parseEther('1')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					await liquidity
						.connect(user)
						.depositNativeToken(
							recipientSaltHash,
							amlPermission,
							eligibilityPermission,
							{ value: depositAmount },
						)

					const recipient = ethers.Wallet.createRandom().address
					await scrollMessenger.processWithdrawals(
						[
							{
								recipient,
								tokenIndex: 0,
								amount: depositAmount,
								nullifier: ethers.encodeBytes32String('test'),
							},
						],
						[],
					)

					// Check if recordContribution was called with correct arguments
					expect(await contribution.latestTag()).to.equal(
						ethers.keccak256(ethers.toUtf8Bytes('PROCESS_DIRECT_WITHDRAWALS')),
					)
					expect(await contribution.latestUser()).to.equal(deployer.address)
					expect(await contribution.latestAmount()).to.equal(1) // Assuming one withdrawal was processed
				})
			})
			describe('ClaimableWithdrawals', () => {
				it('emit WithdrawalClaimable event', async () => {
					const { liquidity, scrollMessenger } = await loadFixture(setup)
					const withdrawalHash = ethers.keccak256(
						ethers.toUtf8Bytes('testWithdrawal'),
					)

					await expect(scrollMessenger.processWithdrawals([], [withdrawalHash]))
						.to.emit(liquidity, 'WithdrawalClaimable')
						.withArgs(withdrawalHash)
				})
				it('call recordContribution', async () => {
					const { scrollMessenger, contribution } = await loadFixture(setup)
					const { deployer } = await getSigners()
					const withdrawalHash = ethers.keccak256(
						ethers.toUtf8Bytes('testWithdrawal'),
					)

					await scrollMessenger.processWithdrawals([], [withdrawalHash])

					// Check if recordContribution was called with correct arguments
					expect(await contribution.latestTag()).to.equal(
						ethers.keccak256(
							ethers.toUtf8Bytes('PROCESS_CLAIMABLE_WITHDRAWALS'),
						),
					)
					expect(await contribution.latestUser()).to.equal(deployer.address) // Using deployer's address as tx.origin
					expect(await contribution.latestAmount()).to.equal(1) // Assuming one withdrawal hash was processed
				})
			})
		})
		describe('fail', () => {
			it('revert SenderIsNotScrollMessenger', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()

				await expect(
					liquidity.connect(user).processWithdrawals([], []),
				).to.be.revertedWithCustomError(liquidity, 'SenderIsNotScrollMessenger')
			})
			it('revert InvalidWithdrawalAddress', async () => {
				const { liquidity, scrollMessenger } = await loadFixture(setup)
				const { user } = await getSigners()

				// Set an invalid withdrawal address
				await scrollMessenger.setXDomainMessageSender(user.address)

				await expect(
					scrollMessenger.processWithdrawals([], []),
				).to.be.revertedWithCustomError(liquidity, 'InvalidWithdrawalAddress')
			})
			it.skip('withdrawals length is 0', async () => {
				// The test is omitted because it is impossible
				// for processWithdrawals to be executed with an empty array of withdrawals,
				// as it is checked in the Withdrawal contract.
			})
			it.skip('withdrawalHashes length is 0', async () => {
				// The test is omitted because it is impossible
				// for processWithdrawals to be executed with an empty array of withdrawalHashes,
				// as it is checked in the Withdrawal contract.
			})
			it.skip('reentrancy attack', async () => {
				// payable(recipient).transfer(amount);
				// The gas consumption is limited to 2500 because the transfer function is performed.
				// Therefore, reentrancy attacks that execute complex logic are not possible.
			})
		})
	})
	describe('claimWithdrawals', () => {
		describe('success', () => {
			describe('send token', () => {
				it('native token', async () => {
					const { liquidity, scrollMessenger, withdrawalLibTest } =
						await loadFixture(setup)
					const { user } = await getSigners()

					// Create a claimable withdrawal
					const withdrawalAmount = ethers.parseEther('1')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					await liquidity.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{
							value: withdrawalAmount,
						},
					)

					const withdrawal = {
						recipient: user.address,
						tokenIndex: 0, // Assuming 0 is the index for native token
						amount: withdrawalAmount,
						nullifier: ethers.encodeBytes32String('test'),
					}

					const withdrawalHash = await withdrawalLibTest.getHash(
						withdrawal.recipient,
						withdrawal.tokenIndex,
						withdrawal.amount,
						withdrawal.nullifier,
					)

					// Process the withdrawal to make it claimable
					await scrollMessenger.processWithdrawals([], [withdrawalHash])

					// Get initial balances
					const initialUserBalance = await ethers.provider.getBalance(
						user.address,
					)
					const initialLiquidityBalance = await ethers.provider.getBalance(
						await liquidity.getAddress(),
					)

					// Claim the withdrawal
					const tx = await liquidity
						.connect(user)
						.claimWithdrawals([withdrawal])
					const receipt = await tx.wait()
					const gasCost = receipt!.gasUsed * receipt!.gasPrice

					// Get final balances
					const finalUserBalance = await ethers.provider.getBalance(
						user.address,
					)
					const finalLiquidityBalance = await ethers.provider.getBalance(
						await liquidity.getAddress(),
					)

					// Check balances
					expect(finalUserBalance).to.equal(
						initialUserBalance + withdrawalAmount - gasCost,
					)
					expect(finalLiquidityBalance).to.equal(
						initialLiquidityBalance - withdrawalAmount,
					)
				})
				it('erc20', async () => {
					const { liquidity, scrollMessenger, withdrawalLibTest } =
						await loadFixture(setup)
					const { user } = await getSigners()

					const testERC20Factory = await ethers.getContractFactory('TestERC20')
					const testERC20 = await testERC20Factory.deploy(user.address)

					const withdrawalAmount = ethers.parseEther('0.000000001')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					// Approve and deposit ERC20 tokens
					await testERC20
						.connect(user)
						.approve(await liquidity.getAddress(), withdrawalAmount)
					await liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							withdrawalAmount,
							amlPermission,
							eligibilityPermission,
						)

					const [, tokenIndex] = await liquidity.getTokenIndex(
						TokenType.ERC20,
						await testERC20.getAddress(),
						0,
					)

					const withdrawal = {
						recipient: user.address,
						tokenIndex,
						amount: withdrawalAmount,
						nullifier: ethers.encodeBytes32String('test'),
					}

					const withdrawalHash = await withdrawalLibTest.getHash(
						withdrawal.recipient,
						withdrawal.tokenIndex,
						withdrawal.amount,
						withdrawal.nullifier,
					)
					await scrollMessenger.processWithdrawals([], [withdrawalHash])

					// Check balances before withdrawal
					const initialUserBalance = await testERC20.balanceOf(user.address)
					const initialLiquidityBalance = await testERC20.balanceOf(
						await liquidity.getAddress(),
					)

					// Claim withdrawal
					await liquidity.connect(user).claimWithdrawals([withdrawal])

					// Check balances after withdrawal
					const finalUserBalance = await testERC20.balanceOf(user.address)
					const finalLiquidityBalance = await testERC20.balanceOf(
						await liquidity.getAddress(),
					)

					// Verify balance changes
					expect(finalUserBalance - initialUserBalance).to.equal(
						withdrawalAmount,
					)
					expect(initialLiquidityBalance - finalLiquidityBalance).to.equal(
						withdrawalAmount,
					)
				})
				it('erc721', async () => {
					const { liquidity, scrollMessenger, withdrawalLibTest } =
						await loadFixture(setup)
					const { deployer, user } = await getSigners()

					const testNFTFactory = await ethers.getContractFactory('TestNFT')
					const testNFT = await testNFTFactory.deploy()

					const tokenId = 1
					await testNFT.transferFrom(deployer.address, user.address, tokenId)
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					// Approve and deposit ERC721 token
					await testNFT
						.connect(user)
						.approve(await liquidity.getAddress(), tokenId)
					await liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
							amlPermission,
							eligibilityPermission,
						)

					const [, tokenIndex] = await liquidity.getTokenIndex(
						TokenType.ERC721,
						await testNFT.getAddress(),
						tokenId,
					)

					const withdrawal = {
						recipient: user.address,
						tokenIndex,
						amount: 1n,
						nullifier: ethers.encodeBytes32String('test'),
					}

					const withdrawalHash = await withdrawalLibTest.getHash(
						withdrawal.recipient,
						withdrawal.tokenIndex,
						withdrawal.amount,
						withdrawal.nullifier,
					)
					await scrollMessenger.processWithdrawals([], [withdrawalHash])

					// Check ownership before withdrawal
					expect(await testNFT.ownerOf(tokenId)).to.equal(
						await liquidity.getAddress(),
					)

					// Claim withdrawal
					await liquidity.connect(user).claimWithdrawals([withdrawal])

					// Check ownership after withdrawal
					expect(await testNFT.ownerOf(tokenId)).to.equal(user.address)
				})
				it('erc1155', async () => {
					const { liquidity, scrollMessenger, withdrawalLibTest } =
						await loadFixture(setup)
					const { user } = await getSigners()

					const testERC1155Factory =
						await ethers.getContractFactory('TestERC1155')
					const testERC1155 = await testERC1155Factory.deploy()

					const tokenId = 1
					const amount = 100
					await testERC1155.mint(user.address, tokenId, amount, '0x')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					const amlPermission = ethers.toUtf8Bytes('AML')
					const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

					// Approve and deposit ERC1155 tokens
					await testERC1155
						.connect(user)
						.setApprovalForAll(await liquidity.getAddress(), true)
					await liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							amount,
							amlPermission,
							eligibilityPermission,
						)

					const [, tokenIndex] = await liquidity.getTokenIndex(
						TokenType.ERC1155,
						await testERC1155.getAddress(),
						tokenId,
					)

					const withdrawal = {
						recipient: user.address,
						tokenIndex,
						amount: BigInt(amount),
						nullifier: ethers.encodeBytes32String('test'),
					}

					const withdrawalHash = await withdrawalLibTest.getHash(
						withdrawal.recipient,
						withdrawal.tokenIndex,
						withdrawal.amount,
						withdrawal.nullifier,
					)
					await scrollMessenger.processWithdrawals([], [withdrawalHash])

					// Check balances before withdrawal
					const initialUserBalance = await testERC1155.balanceOf(
						user.address,
						tokenId,
					)
					const initialLiquidityBalance = await testERC1155.balanceOf(
						await liquidity.getAddress(),
						tokenId,
					)

					// Claim withdrawal
					await liquidity.connect(user).claimWithdrawals([withdrawal])

					// Check balances after withdrawal
					const finalUserBalance = await testERC1155.balanceOf(
						user.address,
						tokenId,
					)
					const finalLiquidityBalance = await testERC1155.balanceOf(
						await liquidity.getAddress(),
						tokenId,
					)

					// Verify balance changes
					expect(finalUserBalance - initialUserBalance).to.equal(amount)
					expect(initialLiquidityBalance - finalLiquidityBalance).to.equal(
						amount,
					)
				})
			})
			it('emit ClaimedWithdrawal', async () => {
				const { liquidity, scrollMessenger, withdrawalLibTest } =
					await loadFixture(setup)
				const { user } = await getSigners()

				// First, create a claimable withdrawal
				const withdrawalAmount = ethers.parseEther('1')
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: withdrawalAmount },
					)

				const withdrawal = {
					recipient: user.address,
					tokenIndex: 0, // Assuming 0 is the index for native token
					amount: withdrawalAmount,
					nullifier: ethers.encodeBytes32String('test'),
				}

				const withdrawalHash = await withdrawalLibTest.getHash(
					withdrawal.recipient,
					withdrawal.tokenIndex,
					withdrawal.amount,
					withdrawal.nullifier,
				)

				// Process the withdrawal to make it claimable
				await scrollMessenger.processWithdrawals([], [withdrawalHash])

				// Now claim the withdrawal
				await expect(liquidity.connect(user).claimWithdrawals([withdrawal]))
					.to.emit(liquidity, 'ClaimedWithdrawal')
					.withArgs(user.address, withdrawalHash)
			})
			it('emit ClaimedWithdrawal for multiple withdrawals', async () => {
				const { liquidity, scrollMessenger, withdrawalLibTest } =
					await loadFixture(setup)
				const { user } = await getSigners()

				// Create two claimable withdrawals
				const withdrawalAmount1 = ethers.parseEther('1')
				const withdrawalAmount2 = ethers.parseEther('2')
				const recipientSaltHash1 = ethers.keccak256(ethers.toUtf8Bytes('test1'))
				const recipientSaltHash2 = ethers.keccak256(ethers.toUtf8Bytes('test2'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash1,
						amlPermission,
						eligibilityPermission,
						{ value: withdrawalAmount1 },
					)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash2,
						amlPermission,
						eligibilityPermission,
						{ value: withdrawalAmount2 },
					)

				const withdrawal1 = {
					recipient: user.address,
					tokenIndex: 0,
					amount: withdrawalAmount1,
					nullifier: ethers.encodeBytes32String('test1'),
				}

				const withdrawal2 = {
					recipient: user.address,
					tokenIndex: 0,
					amount: withdrawalAmount2,
					nullifier: ethers.encodeBytes32String('test2'),
				}

				const withdrawalHash1 = await withdrawalLibTest.getHash(
					withdrawal1.recipient,
					withdrawal1.tokenIndex,
					withdrawal1.amount,
					withdrawal1.nullifier,
				)
				const withdrawalHash2 = await withdrawalLibTest.getHash(
					withdrawal2.recipient,
					withdrawal2.tokenIndex,
					withdrawal2.amount,
					withdrawal2.nullifier,
				)

				// Process both withdrawals to make them claimable
				await scrollMessenger.processWithdrawals(
					[],
					[withdrawalHash1, withdrawalHash2],
				)

				await liquidity
					.connect(user)
					.claimWithdrawals([withdrawal1, withdrawal2])

				const filter = liquidity.filters.ClaimedWithdrawal()
				const claimedEvents = await liquidity.queryFilter(filter)

				expect(claimedEvents?.length).to.equal(2)

				// Check the details of each event
				expect(claimedEvents?.[0].args?.recipient).to.equal(user.address)
				expect(claimedEvents?.[0].args?.withdrawalHash).to.equal(
					withdrawalHash1,
				)

				expect(claimedEvents?.[1].args?.recipient).to.equal(user.address)
				expect(claimedEvents?.[1].args?.withdrawalHash).to.equal(
					withdrawalHash2,
				)
			})
		})
		describe('fail', () => {
			it('revert WithdrawalNotFound', async () => {
				const { liquidity, withdrawalLibTest } = await loadFixture(setup)
				const { user } = await getSigners()

				// Create a withdrawal object that hasn't been processed
				const nonExistentWithdrawal = {
					recipient: user.address,
					tokenIndex: 0, // Assuming 0 is for native token
					amount: ethers.parseEther('1'),
					nullifier: ethers.encodeBytes32String('test999'), // Use a high number to ensure it doesn't exist
				}

				const withdrawalHash = withdrawalLibTest.getHash(
					nonExistentWithdrawal.recipient,
					nonExistentWithdrawal.tokenIndex,
					nonExistentWithdrawal.amount,
					nonExistentWithdrawal.nullifier,
				)

				// Attempt to claim the non-existent withdrawal
				await expect(
					liquidity.connect(user).claimWithdrawals([nonExistentWithdrawal]),
				)
					.to.be.revertedWithCustomError(liquidity, 'WithdrawalNotFound')
					.withArgs(withdrawalHash)
			})
			it('rejects duplicate withdrawal claims', async () => {
				const { liquidity, scrollMessenger, withdrawalLibTest } =
					await loadFixture(setup)
				const { user } = await getSigners()

				// Create a claimable withdrawal
				const withdrawalAmount = ethers.parseEther('1')
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const amlPermission = ethers.toUtf8Bytes('AML')
				const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

				await liquidity.depositNativeToken(
					recipientSaltHash,
					amlPermission,
					eligibilityPermission,
					{
						value: withdrawalAmount,
					},
				)

				const withdrawal = {
					recipient: user.address,
					tokenIndex: 0, // Assuming 0 is the index for native token
					amount: withdrawalAmount,
					nullifier: ethers.encodeBytes32String('test'),
				}

				const withdrawalHash = await withdrawalLibTest.getHash(
					withdrawal.recipient,
					withdrawal.tokenIndex,
					withdrawal.amount,
					withdrawal.nullifier,
				)
				// Process the withdrawal to make it claimable
				await scrollMessenger.processWithdrawals([], [withdrawalHash])
				// Claim the withdrawal
				await liquidity.connect(user).claimWithdrawals([withdrawal])
				await expect(liquidity.connect(user).claimWithdrawals([withdrawal]))
					.to.be.revertedWithCustomError(liquidity, 'WithdrawalNotFound')
					.withArgs(withdrawalHash)
			})
			it.skip('reentrancy attack', async () => {
				// payable(recipient).transfer(amount);
				// The gas consumption is limited to 2500 because the transfer function is performed.
				// Therefore, reentrancy attacks that execute complex logic are not possible.
			})
		})
	})
	describe('onERC1155Received', () => {
		it('get selector', async () => {
			const { liquidity } = await loadFixture(setup)
			const result = await liquidity.onERC1155Received(
				ethers.ZeroAddress,
				ethers.ZeroAddress,
				0,
				0,
				ethers.ZeroHash,
			)
			expect(result).to.equal('0xf23a6e61')
		})
	})
	describe('getDepositData', () => {
		it('get DepositData', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()

			// Create some deposits using ETH
			const depositAmount = ethers.parseEther('1')
			const amlPermission = ethers.toUtf8Bytes('AML')
			const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

			for (let i = 0; i < 5; i++) {
				const recipientSaltHash = ethers.keccak256(
					ethers.toUtf8Bytes(`test${i}`),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
			}

			const depositData0 = await liquidity.getDepositData(1)
			const depositHash0 = getDepositHash(
				user.address,
				ethers.keccak256(ethers.toUtf8Bytes('test0')),
				depositAmount,
				0,
				true,
			)

			expect(depositData0.depositHash).to.equal(depositHash0)
			expect(depositData0.sender).to.equal(user.address)

			const depositData2 = await liquidity.getDepositData(3)
			const depositHash2 = getDepositHash(
				user.address,
				ethers.keccak256(ethers.toUtf8Bytes('test2')),
				depositAmount,
				0,
				true,
			)

			expect(depositData2.depositHash).to.equal(depositHash2)
			expect(depositData2.sender).to.equal(user.address)
		})
	})
	describe('getDepositDataBatch', () => {
		it('get DepositData list', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()

			// Create some deposits using ETH
			const depositAmount = ethers.parseEther('1')
			const amlPermission = ethers.toUtf8Bytes('AML')
			const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

			for (let i = 0; i < 5; i++) {
				const recipientSaltHash = ethers.keccak256(
					ethers.toUtf8Bytes(`test${i}`),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
			}

			const depositDataList = await liquidity.getDepositDataBatch([1, 3])
			const depositHash0 = getDepositHash(
				user.address,
				ethers.keccak256(ethers.toUtf8Bytes('test0')),
				depositAmount,
				0,
				true,
			)

			const depositHash2 = getDepositHash(
				user.address,
				ethers.keccak256(ethers.toUtf8Bytes('test2')),
				depositAmount,
				0,
				true,
			)

			expect(depositDataList[0].depositHash).to.equal(depositHash0)
			expect(depositDataList[0].sender).to.equal(user.address)

			expect(depositDataList[1].depositHash).to.equal(depositHash2)
			expect(depositDataList[1].sender).to.equal(user.address)
		})
	})
	describe('getDepositDataHash', () => {
		it('get getDepositDataHash', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()

			// Create some deposits using ETH
			const depositAmount = ethers.parseEther('1')
			const amlPermission = ethers.toUtf8Bytes('AML')
			const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

			for (let i = 0; i < 5; i++) {
				const recipientSaltHash = ethers.keccak256(
					ethers.toUtf8Bytes(`test${i}`),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
			}

			const depositDataHash0 = await liquidity.getDepositDataHash(1)
			const depositHash0 = getDepositHash(
				user.address,
				ethers.keccak256(ethers.toUtf8Bytes('test0')),
				depositAmount,
				0,
				true,
			)

			expect(depositDataHash0).to.equal(depositHash0)

			const depositDataHash2 = await liquidity.getDepositDataHash(3)
			const depositHash2 = getDepositHash(
				user.address,
				ethers.keccak256(ethers.toUtf8Bytes('test2')),
				depositAmount,
				0,
				true,
			)

			expect(depositDataHash2).to.equal(depositHash2)
		})
	})

	describe('getLastRelayedDepositId, getLastDepositId', () => {
		it('get DepositId', async () => {
			const { liquidity } = await loadFixture(setup)
			const { relayer, user } = await getSigners()

			expect(await liquidity.getLastRelayedDepositId()).to.equal(0)
			expect(await liquidity.getLastDepositId()).to.equal(0)

			// Create some deposits using ETH
			const depositAmount = ethers.parseEther('1')
			const amlPermission = ethers.toUtf8Bytes('AML')
			const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

			for (let i = 0; i < 5; i++) {
				const recipientSaltHash = ethers.keccak256(
					ethers.toUtf8Bytes(`test${i}`),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(
						recipientSaltHash,
						amlPermission,
						eligibilityPermission,
						{ value: depositAmount },
					)
			}

			expect(await liquidity.getLastRelayedDepositId()).to.equal(0)
			expect(await liquidity.getLastDepositId()).to.equal(5)

			await liquidity.connect(relayer).relayDeposits(3, 1000000)

			expect(await liquidity.getLastRelayedDepositId()).to.equal(3)
			expect(await liquidity.getLastDepositId()).to.equal(5)
		})
	})
	describe('isDepositValid', () => {
		it('return true', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()
			const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const depositAmount = ethers.parseEther('1')
			const amlPermission = ethers.toUtf8Bytes('AML')
			const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

			const currentDepositId = await liquidity.getLastDepositId()
			await liquidity
				.connect(user)
				.depositNativeToken(
					recipientSaltHash,
					amlPermission,
					eligibilityPermission,
					{ value: depositAmount },
				)
			const result = await liquidity.isDepositValid(
				currentDepositId + 1n,
				recipientSaltHash,
				0, // tokenIndex for ETH should be 0
				depositAmount,
				true,
				user.address,
			)
			expect(result).to.equal(true)
		})
		it('return false(depositHash)', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()
			const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const depositAmount = ethers.parseEther('1')
			const amlPermission = ethers.toUtf8Bytes('AML')
			const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

			const currentDepositId = await liquidity.getLastDepositId()
			await liquidity
				.connect(user)
				.depositNativeToken(
					recipientSaltHash,
					amlPermission,
					eligibilityPermission,
					{ value: depositAmount },
				)
			const result = await liquidity.isDepositValid(
				currentDepositId + 1n,
				recipientSaltHash,
				0, // tokenIndex for ETH should be 0
				depositAmount + 1n,
				true,
				user.address,
			)
			expect(result).to.equal(false)
		})
		it('return false(address)', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()
			const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const depositAmount = ethers.parseEther('1')
			const amlPermission = ethers.toUtf8Bytes('AML')
			const eligibilityPermission = ethers.toUtf8Bytes('Eligibility')

			const currentDepositId = await liquidity.getLastDepositId()
			await liquidity
				.connect(user)
				.depositNativeToken(
					recipientSaltHash,
					amlPermission,
					eligibilityPermission,
					{ value: depositAmount },
				)
			const result = await liquidity.isDepositValid(
				currentDepositId + 1n,
				recipientSaltHash,
				0, // tokenIndex for ETH should be 0
				depositAmount,
				true,
				ethers.ZeroAddress,
			)
			expect(result).to.equal(false)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const { liquidity } = await loadFixture(setup)
			const { admin } = await getSigners()
			const liquidity2Factory = await ethers.getContractFactory(
				'Liquidity2Test',
				admin,
			)
			const next = await upgrades.upgradeProxy(
				await liquidity.getAddress(),
				liquidity2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const beforeRole = await liquidity.RELAYER()

			const afterRole = await next.RELAYER()
			expect(afterRole).to.equal(beforeRole)
			const val = await next.getVal()
			expect(val).to.equal(7)
		})
		it('Cannot upgrade except for a deployer.', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()
			const liquidity2Factory = await ethers.getContractFactory(
				'Liquidity2Test',
				user,
			)
			const role = await liquidity.DEFAULT_ADMIN_ROLE()
			await expect(
				upgrades.upgradeProxy(await liquidity.getAddress(), liquidity2Factory, {
					unsafeAllow: ['constructor'],
				}),
			)
				.to.be.revertedWithCustomError(
					liquidity,
					'AccessControlUnauthorizedAccount',
				)
				.withArgs(user.address, role)
		})
	})
})
