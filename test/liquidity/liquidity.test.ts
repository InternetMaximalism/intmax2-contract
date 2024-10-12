import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import {
	Liquidity,
	L1ScrollMessengerTestForLiquidity,
	ContributionTest,
	TestERC20,
	TestNFT,
	TestERC1155,
} from '../../typechain-types'
import { getDepositHash } from '../common.test'
import { INITIAL_ERC20_TOKEN_ADDRESSES, TokenType } from './common.test'

describe('Liquidity', () => {
	type TestObjects = {
		liquidity: Liquidity
		scrollMessenger: L1ScrollMessengerTestForLiquidity
		rollup: string
		withdrawal: string
		contribution: ContributionTest
	}
	async function setup(): Promise<TestObjects> {
		const l1ScrollMessengerFactory = await ethers.getContractFactory(
			'L1ScrollMessengerTestForLiquidity',
		)
		const l1ScrollMessenger = await l1ScrollMessengerFactory.deploy()
		const rollup = ethers.Wallet.createRandom().address
		const withdrawal = ethers.Wallet.createRandom().address
		await l1ScrollMessenger.setXDomainMessageSender(withdrawal)
		const contributionFactory =
			await ethers.getContractFactory('ContributionTest')
		const contribution = await contributionFactory.deploy()
		const { analyzer } = await getSigners()
		const liquidityFactory = await ethers.getContractFactory('Liquidity')
		const liquidity = (await upgrades.deployProxy(
			liquidityFactory,
			[
				await l1ScrollMessenger.getAddress(),
				rollup,
				withdrawal,
				analyzer.address,
				await contribution.getAddress(),
				INITIAL_ERC20_TOKEN_ADDRESSES,
			],
			{ kind: 'uups', unsafeAllow: ['constructor'] },
		)) as unknown as Liquidity
		await l1ScrollMessenger.setLiquidity(await liquidity.getAddress())
		return {
			liquidity,
			scrollMessenger: l1ScrollMessenger,
			rollup,
			withdrawal,
			contribution,
		}
	}
	type Signers = {
		deployer: HardhatEthersSigner
		analyzer: HardhatEthersSigner
		user: HardhatEthersSigner
	}
	const getSigners = async (): Promise<Signers> => {
		const [deployer, analyzer, user] = await ethers.getSigners()
		return {
			deployer,
			analyzer,
			user,
		}
	}
	describe('initialize', () => {
		describe('success', () => {
			it('deployer has admin role', async () => {
				const { liquidity } = await loadFixture(setup)
				const { deployer } = await getSigners()
				const role = await liquidity.DEFAULT_ADMIN_ROLE()
				expect(await liquidity.hasRole(role, deployer.address)).to.be.true
			})
			it('analyzer has analyzer role', async () => {
				const { liquidity } = await loadFixture(setup)
				const { analyzer } = await getSigners()
				const role = await liquidity.ANALYZER()
				expect(await liquidity.hasRole(role, analyzer.address)).to.be.true
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
						[ethers.ZeroAddress, ethers.ZeroAddress],
					),
				).to.be.revertedWithCustomError(liquidity, 'InvalidInitialization')
			})
			it('l1ScrollMessenger is zero address', async () => {
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
			it('withdrawal is zero address', async () => {
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
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
			})
			it('analyzer is zero address', async () => {
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
							ethers.ZeroAddress,
							INITIAL_ERC20_TOKEN_ADDRESSES,
						],
						{ kind: 'uups', unsafeAllow: ['constructor'] },
					),
				).to.be.revertedWithCustomError(liquidityFactory, 'AddressZero')
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

				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(recipientSaltHash, { value: depositAmount }),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						0, // tokenIndex for ETH should be 0
						depositAmount,
						currentTimestamp!.timestamp + 1,
					)
			})
			it('transfer eth', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmountEther = '1'
				const depositAmount = ethers.parseEther(depositAmountEther)

				const initialBalance = await ethers.provider.getBalance(
					await liquidity.getAddress(),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash, { value: depositAmount })
				const finalBalance = await ethers.provider.getBalance(
					await liquidity.getAddress(),
				)

				expect(finalBalance - initialBalance).to.equal(depositAmount)
			})
		})

		describe('fail', () => {
			it('revert RecipientSaltHashAlreadyUsed', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('1')
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash, { value: depositAmount })

				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(recipientSaltHash, { value: depositAmount }),
				).to.be.revertedWithCustomError(
					liquidity,
					'RecipientSaltHashAlreadyUsed',
				)
			})
			it('revert TriedToDepositZero', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))

				await expect(
					liquidity
						.connect(user)
						.depositNativeToken(recipientSaltHash, { value: 0 }),
				).to.be.revertedWithCustomError(liquidity, 'TriedToDepositZero')
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
				const depositAmount = ethers.parseEther('100')

				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				const currentDepositId = await liquidity.getLastDepositId()
				const currentTimestamp = await ethers.provider.getBlock('latest')

				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
						),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						3, // new token index
						depositAmount,
						currentTimestamp!.timestamp + 1,
					)
			})
			it('transfer ERC20', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('100')

				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)

				const erc20Address = await testERC20.getAddress()

				await expect(() =>
					liquidity
						.connect(user)
						.depositERC20(erc20Address, recipientSaltHash, depositAmount),
				).to.changeTokenBalances(
					testERC20,
					[user, liquidity],
					[-depositAmount, depositAmount],
				)
			})
		})

		describe('fail', () => {
			it('revert RecipientSaltHashAlreadyUsed', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const depositAmount = ethers.parseEther('100')

				await testERC20
					.connect(user)
					.approve(await liquidity.getAddress(), depositAmount)
				await liquidity
					.connect(user)
					.depositERC20(
						await testERC20.getAddress(),
						recipientSaltHash,
						depositAmount,
					)

				await expect(
					liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
						),
				).to.be.revertedWithCustomError(
					liquidity,
					'RecipientSaltHashAlreadyUsed',
				)
			})
			it('revert TriedToDepositZero', async () => {
				const { liquidity, testERC20 } = await loadFixture(setupForDepositERC20)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))

				await expect(
					liquidity
						.connect(user)
						.depositERC20(await testERC20.getAddress(), recipientSaltHash, 0),
				).to.be.revertedWithCustomError(liquidity, 'TriedToDepositZero')
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

				await expect(
					liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
						),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						3, // new token index
						1, // amount is always 1 for ERC721
						currentTimestamp!.timestamp + 1,
					)
			})
			it('transfer NFT', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)

				expect(await testNFT.ownerOf(tokenId)).to.equal(user.address)

				await liquidity
					.connect(user)
					.depositERC721(await testNFT.getAddress(), recipientSaltHash, tokenId)

				expect(await testNFT.ownerOf(tokenId)).to.equal(
					await liquidity.getAddress(),
				)
			})
		})
		describe('fail', () => {
			it('revert RecipientSaltHashAlreadyUsed', async () => {
				const { liquidity, testNFT } = await loadFixture(setupForDepositERC721)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 0

				await testNFT
					.connect(user)
					.approve(await liquidity.getAddress(), tokenId)
				await liquidity
					.connect(user)
					.depositERC721(await testNFT.getAddress(), recipientSaltHash, tokenId)

				await expect(
					liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
						),
				).to.be.revertedWithCustomError(
					liquidity,
					'RecipientSaltHashAlreadyUsed',
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

				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
						),
				)
					.to.emit(liquidity, 'Deposited')
					.withArgs(
						currentDepositId + 1n,
						user.address,
						recipientSaltHash,
						3, // new token index for the first ERC1155
						depositAmount,
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
		})
		describe('fail', () => {
			it('revert RecipientSaltHashAlreadyUsed', async () => {
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

				await liquidity
					.connect(user)
					.depositERC1155(
						await testERC1155.getAddress(),
						recipientSaltHash,
						tokenId,
						depositAmount,
					)

				await expect(
					liquidity
						.connect(user)
						.depositERC1155(
							await testERC1155.getAddress(),
							recipientSaltHash,
							tokenId,
							depositAmount,
						),
				).to.be.revertedWithCustomError(
					liquidity,
					'RecipientSaltHashAlreadyUsed',
				)
			})
			it('revert TriedToDepositZero', async () => {
				const { liquidity, testERC1155 } = await loadFixture(
					setupForDepositERC1155,
				)
				const { user } = await getSigners()
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				const tokenId = 1
				const depositAmount = 0

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
						),
				).to.be.revertedWithCustomError(liquidity, 'TriedToDepositZero')
			})
		})
	})
	describe('analyzeAndRelayDeposits', () => {
		describe('success', () => {
			it('send scroll messenger', async () => {
				const { liquidity, scrollMessenger, rollup } = await loadFixture(setup)
				const { analyzer, user } = await getSigners()

				// Create some deposits using ETH
				const depositAmount = ethers.parseEther('1')

				for (let i = 0; i < 5; i++) {
					const recipientSaltHash = ethers.keccak256(
						ethers.toUtf8Bytes(`test${i}`),
					)
					await liquidity
						.connect(user)
						.depositNativeToken(recipientSaltHash, { value: depositAmount })
				}

				const upToDepositId = 5
				const rejectDepositIds: number[] = [2, 4]
				const gasLimit = 1000000

				await liquidity
					.connect(analyzer)
					.analyzeAndRelayDeposits(upToDepositId, rejectDepositIds, gasLimit, {
						value: ethers.parseEther('1'),
					})

				expect(await scrollMessenger.to()).to.equal(rollup)
				expect(await scrollMessenger.value()).to.equal(0)
				expect(await scrollMessenger.gasLimit()).to.equal(gasLimit)
				expect(await scrollMessenger.sender()).to.equal(analyzer.address)
				expect(await scrollMessenger.msgValue()).to.equal(
					ethers.parseEther('1'),
				)

				const depositHash0 = getDepositHash(
					ethers.keccak256(ethers.toUtf8Bytes('test0')),
					0,
					depositAmount,
				)

				const depositHash2 = getDepositHash(
					ethers.keccak256(ethers.toUtf8Bytes('test2')),
					0,
					depositAmount,
				)

				const depositHash4 = getDepositHash(
					ethers.keccak256(ethers.toUtf8Bytes('test4')),
					0,
					depositAmount,
				)

				const funcSelector = ethers
					.id('processDeposits(uint256,bytes32[])')
					.slice(0, 10)

				const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
					['uint256', 'bytes32[]'],
					[upToDepositId, [depositHash0, depositHash2, depositHash4]],
				)
				const encodedData = funcSelector + encodedParams.slice(2)
				expect(await scrollMessenger.message()).to.equal(encodedData)
			})
			it('emit DepositsAnalyzedAndRelayed event', async () => {
				const { liquidity } = await loadFixture(setup)
				const { analyzer, user } = await getSigners()

				// Create some deposits using ETH
				const depositAmount = ethers.parseEther('1')

				for (let i = 0; i < 5; i++) {
					const recipientSaltHash = ethers.keccak256(
						ethers.toUtf8Bytes(`test${i}`),
					)
					await liquidity
						.connect(user)
						.depositNativeToken(recipientSaltHash, { value: depositAmount })
				}

				const upToDepositId = 5
				const rejectDepositIds: number[] = [2, 4]
				const gasLimit = 1000000

				const depositHash0 = getDepositHash(
					ethers.keccak256(ethers.toUtf8Bytes('test0')),
					0,
					depositAmount,
				)

				const depositHash2 = getDepositHash(
					ethers.keccak256(ethers.toUtf8Bytes('test2')),
					0,
					depositAmount,
				)

				const depositHash4 = getDepositHash(
					ethers.keccak256(ethers.toUtf8Bytes('test4')),
					0,
					depositAmount,
				)

				const funcSelector = ethers
					.id('processDeposits(uint256,bytes32[])')
					.slice(0, 10)

				const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
					['uint256', 'bytes32[]'],
					[upToDepositId, [depositHash0, depositHash2, depositHash4]],
				)
				const expectedEncodedData = funcSelector + encodedParams.slice(2)

				await expect(
					liquidity
						.connect(analyzer)
						.analyzeAndRelayDeposits(
							upToDepositId,
							rejectDepositIds,
							gasLimit,
							{ value: ethers.parseEther('1') },
						),
				)
					.to.emit(liquidity, 'DepositsAnalyzedAndRelayed')
					.withArgs(
						upToDepositId,
						rejectDepositIds,
						gasLimit,
						expectedEncodedData,
					)
			})
		})
		describe('fail', () => {
			it('only analyzer', async () => {
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()
				const upToDepositId = 5
				const rejectDepositIds: number[] = [2, 4]
				const gasLimit = 1000000

				await expect(
					liquidity
						.connect(user)
						.analyzeAndRelayDeposits(upToDepositId, rejectDepositIds, gasLimit),
				)
					.to.be.revertedWithCustomError(
						liquidity,
						'AccessControlUnauthorizedAccount',
					)
					.withArgs(user.address, await liquidity.ANALYZER())
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
				await testObjects.liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash, { value: depositAmount })
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
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
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

					const depositAmount = ethers.parseEther('100')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))

					await testERC20
						.connect(user)
						.approve(await liquidity.getAddress(), depositAmount)
					await liquidity
						.connect(user)
						.depositERC20(
							await testERC20.getAddress(),
							recipientSaltHash,
							depositAmount,
						)

					const depositId = await liquidity.getLastDepositId()

					// Check balances before cancellation
					const initialUserBalance = await testERC20.balanceOf(user.address)
					const initialLiquidityBalance = await testERC20.balanceOf(
						await liquidity.getAddress(),
					)

					await liquidity.connect(user).cancelDeposit(depositId, {
						recipientSaltHash,
						tokenIndex: 3, // Assuming 1 is the index for the first ERC20 token
						amount: depositAmount,
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

					await testNFT
						.connect(user)
						.approve(await liquidity.getAddress(), tokenId)
					await liquidity
						.connect(user)
						.depositERC721(
							await testNFT.getAddress(),
							recipientSaltHash,
							tokenId,
						)

					const depositId = await liquidity.getLastDepositId()

					await liquidity.connect(user).cancelDeposit(depositId, {
						recipientSaltHash,
						tokenIndex: 3,
						amount: 1,
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
						)

					const depositId = await liquidity.getLastDepositId()
					const initialBalance = await testERC1155.balanceOf(
						user.address,
						tokenId,
					)

					await liquidity.connect(user).cancelDeposit(depositId, {
						recipientSaltHash,
						tokenIndex: 3, // Assuming 3 is the index for the first ERC1155 token
						amount: amount,
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
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
					}),
				)
					.to.emit(liquidity, 'DepositCanceled')
					.withArgs(depositId)
			})
			it('can rejected deposit', async () => {
				const { liquidity, depositAmount, recipientSaltHash, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user, analyzer } = await getSigners()

				await liquidity
					.connect(analyzer)
					.analyzeAndRelayDeposits(depositId, [depositId], 1000000, {
						value: ethers.parseEther('1'),
					})
				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
					}),
				)
					.to.emit(liquidity, 'DepositCanceled')
					.withArgs(depositId)
			})
			it('can deposit not analyzed amount', async () => {
				const { liquidity, depositAmount, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user, analyzer } = await getSigners()

				await liquidity
					.connect(analyzer)
					.analyzeAndRelayDeposits(depositId, [depositId], 1000000, {
						value: ethers.parseEther('1'),
					})

				const recipientSaltHash2 = ethers.keccak256(ethers.toUtf8Bytes('test2'))
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash2, { value: depositAmount })
				const nextDepositId = depositId + 1n
				await expect(
					liquidity.connect(user).cancelDeposit(nextDepositId, {
						recipientSaltHash: recipientSaltHash2,
						tokenIndex: 0,
						amount: depositAmount,
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
				const { analyzer } = await getSigners()

				await expect(
					liquidity.connect(analyzer).cancelDeposit(depositId, {
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
					}),
				).to.be.revertedWithCustomError(liquidity, 'OnlySenderCanCancelDeposit')
			})
			it('revert InvalidDepositHash', async () => {
				const { liquidity, depositAmount, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user } = await getSigners()

				const wrongHash = ethers.keccak256(ethers.toUtf8Bytes('wrong'))
				const depositData = await liquidity.getDepositData(depositId)
				const wrongDepositHash = getDepositHash(wrongHash, 0, depositAmount)

				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						recipientSaltHash: wrongHash,
						tokenIndex: 0,
						amount: depositAmount,
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
					recipientSaltHash,
					tokenIndex: 0,
					amount: depositAmount,
				})

				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
					}),
				).to.be.revertedWithCustomError(liquidity, 'OnlySenderCanCancelDeposit')
			})
			it('cannot not rejected deposit', async () => {
				const { liquidity, depositAmount, recipientSaltHash, depositId } =
					await loadFixture(setupCancelDeposit)
				const { user, analyzer } = await getSigners()
				await liquidity
					.connect(analyzer)
					.analyzeAndRelayDeposits(depositId, [], 1000000, {
						value: ethers.parseEther('1'),
					})
				await expect(
					liquidity.connect(user).cancelDeposit(depositId, {
						recipientSaltHash,
						tokenIndex: 0,
						amount: depositAmount,
					}),
				).to.be.revertedWithCustomError(liquidity, 'AlreadyAnalyzed')
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
						const { liquidity, scrollMessenger } = await loadFixture(setup)
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)
						const depositAmount = ethers.parseEther('1')
						await liquidity.depositNativeToken(recipientSaltHash, {
							value: depositAmount,
						})
						const initialBalance = await ethers.provider.getBalance(
							await liquidity.getAddress(),
						)
						await scrollMessenger.processWithdrawals(
							2,
							[
								{
									recipient: ethers.Wallet.createRandom().address,
									tokenIndex: 0,
									amount: depositAmount,
									id: 0,
								},
							],
							0,
							[],
						)
						const finalBalance = await ethers.provider.getBalance(
							await liquidity.getAddress(),
						)
						expect(initialBalance - finalBalance).to.equal(depositAmount)
					})
					it('erc20', async () => {
						const { liquidity, scrollMessenger } = await loadFixture(setup)
						const { user } = await getSigners()
						const testERC20Factory =
							await ethers.getContractFactory('TestERC20')
						const testERC20 = await testERC20Factory.deploy(user.address)
						const depositAmount = ethers.parseEther('100')
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)

						await testERC20
							.connect(user)
							.approve(await liquidity.getAddress(), depositAmount)
						await liquidity
							.connect(user)
							.depositERC20(
								testERC20.getAddress(),
								recipientSaltHash,
								depositAmount,
							)

						const recipient = ethers.Wallet.createRandom().address
						const [, tokenIndex] = await liquidity.getTokenIndex(
							TokenType.ERC20,
							testERC20.getAddress(),
							0,
						)
						const beforeBalance = await testERC20.balanceOf(recipient)
						await scrollMessenger.processWithdrawals(
							2,
							[
								{
									recipient: recipient,
									tokenIndex: tokenIndex,
									amount: depositAmount,
									id: 0,
								},
							],
							0,
							[],
						)
						const afterBalance = await testERC20.balanceOf(recipient)
						expect(afterBalance - beforeBalance).to.equal(depositAmount)
					})
					it('erc721', async () => {
						const { liquidity, scrollMessenger } = await loadFixture(setup)
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

						await testNFT
							.connect(user)
							.approve(await liquidity.getAddress(), tokenId)
						await liquidity
							.connect(user)
							.depositERC721(testNFT.getAddress(), recipientSaltHash, tokenId)

						const recipient = ethers.Wallet.createRandom().address
						const [, tokenIndex] = await liquidity.getTokenIndex(
							TokenType.ERC721,
							testNFT.getAddress(),
							tokenId,
						)

						const beforeOwner = await testNFT.ownerOf(tokenId)
						await scrollMessenger.processWithdrawals(
							2,
							[{ recipient, tokenIndex, amount: 1, id: 0 }],
							0,
							[],
						)
						const afterOwner = await testNFT.ownerOf(tokenId)

						expect(beforeOwner).to.equal(await liquidity.getAddress())
						expect(afterOwner).to.equal(recipient)
					})
					it('erc1155', async () => {
						const { liquidity, scrollMessenger } = await loadFixture(setup)
						const { user } = await getSigners()
						const testERC1155Factory = await ethers.getContractFactory(
							'TestERC1155',
							user,
						)
						const testERC1155 = await testERC1155Factory.deploy()
						const tokenId = 1
						const amount = 100
						const recipientSaltHash = ethers.keccak256(
							ethers.toUtf8Bytes('test'),
						)

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
							)

						const recipient = ethers.Wallet.createRandom().address
						const [, tokenIndex] = await liquidity.getTokenIndex(
							TokenType.ERC1155,
							testERC1155.getAddress(),
							tokenId,
						)

						const beforeBalanceLiquidity = await testERC1155.balanceOf(
							await liquidity.getAddress(),
							tokenId,
						)
						const beforeBalanceRecipient = await testERC1155.balanceOf(
							recipient,
							tokenId,
						)

						await scrollMessenger.processWithdrawals(
							2,
							[{ recipient, tokenIndex, amount, id: 0 }],
							0,
							[],
						)

						const afterBalanceLiquidity = await testERC1155.balanceOf(
							await liquidity.getAddress(),
							tokenId,
						)
						const afterBalanceRecipient = await testERC1155.balanceOf(
							recipient,
							tokenId,
						)

						expect(beforeBalanceLiquidity).to.equal(amount)
						expect(beforeBalanceRecipient).to.equal(0)
						expect(afterBalanceLiquidity).to.equal(0)
						expect(afterBalanceRecipient).to.equal(amount)
					})
				})
				it('emit DirectWithdrawalsProcessed event', async () => {
					const { liquidity, scrollMessenger } = await loadFixture(setup)
					const { user } = await getSigners()

					// Setup a deposit to ensure there's something to withdraw
					const depositAmount = ethers.parseEther('1')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					await liquidity
						.connect(user)
						.depositNativeToken(recipientSaltHash, { value: depositAmount })

					const recipient = ethers.Wallet.createRandom().address
					const lastProcessedDirectWithdrawalId = 5 // Assuming this is the current last processed ID

					await expect(
						scrollMessenger.processWithdrawals(
							lastProcessedDirectWithdrawalId,
							[{ recipient, tokenIndex: 0, amount: depositAmount, id: 0 }],
							0,
							[],
						),
					)
						.to.emit(liquidity, 'DirectWithdrawalsProcessed')
						.withArgs(lastProcessedDirectWithdrawalId)
				})
				it('call recordContribution', async () => {
					const { liquidity, scrollMessenger, contribution } =
						await loadFixture(setup)
					const { deployer, user } = await getSigners()

					// Setup a deposit to ensure there's something to withdraw
					const depositAmount = ethers.parseEther('1')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					await liquidity
						.connect(user)
						.depositNativeToken(recipientSaltHash, { value: depositAmount })

					const recipient = ethers.Wallet.createRandom().address
					const lastProcessedDirectWithdrawalId = 5 // Assuming this is the current last processed ID

					await scrollMessenger.processWithdrawals(
						lastProcessedDirectWithdrawalId,
						[{ recipient, tokenIndex: 0, amount: depositAmount, id: 0 }],
						0,
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

					await expect(
						scrollMessenger.processWithdrawals(
							0,
							[],
							5, // lastProcessedClaimableWithdrawalId
							[withdrawalHash],
						),
					)
						.to.emit(liquidity, 'WithdrawalClaimable')
						.withArgs(withdrawalHash)
				})
				it('emit ClaimableWithdrawalsProcessed event', async () => {
					const { liquidity, scrollMessenger } = await loadFixture(setup)
					const withdrawalHash = ethers.keccak256(
						ethers.toUtf8Bytes('testWithdrawal'),
					)
					const lastProcessedClaimableWithdrawalId = 5

					await expect(
						scrollMessenger.processWithdrawals(
							0,
							[],
							lastProcessedClaimableWithdrawalId,
							[withdrawalHash],
						),
					)
						.to.emit(liquidity, 'ClaimableWithdrawalsProcessed')
						.withArgs(lastProcessedClaimableWithdrawalId)
				})
				it('call recordContribution', async () => {
					const { scrollMessenger, contribution } = await loadFixture(setup)
					const { deployer } = await getSigners()
					const withdrawalHash = ethers.keccak256(
						ethers.toUtf8Bytes('testWithdrawal'),
					)
					const lastProcessedClaimableWithdrawalId = 5

					await scrollMessenger.processWithdrawals(
						0,
						[],
						lastProcessedClaimableWithdrawalId,
						[withdrawalHash],
					)

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
					liquidity.connect(user).processWithdrawals(0, [], 0, []),
				).to.be.revertedWithCustomError(liquidity, 'SenderIsNotScrollMessenger')
			})
			it('revert InvalidWithdrawalAddress', async () => {
				const { liquidity, scrollMessenger } = await loadFixture(setup)
				const { user } = await getSigners()

				// Set an invalid withdrawal address
				await scrollMessenger.setXDomainMessageSender(user.address)

				await expect(
					scrollMessenger.processWithdrawals(0, [], 0, []),
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
		const getWithdrawalHash = (withdrawal: {
			recipient: string
			tokenIndex: number | bigint
			amount: bigint
			id: number
		}): string => {
			return ethers.keccak256(
				ethers.solidityPacked(
					['address', 'uint32', 'uint256', 'uint256'],
					[
						withdrawal.recipient,
						withdrawal.tokenIndex,
						withdrawal.amount,
						withdrawal.id,
					],
				),
			)
		}
		describe('success', () => {
			describe('send token', () => {
				it('native token', async () => {
					const { liquidity, scrollMessenger } = await loadFixture(setup)
					const { user } = await getSigners()

					// Create a claimable withdrawal
					const withdrawalAmount = ethers.parseEther('1')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
					await liquidity.depositNativeToken(recipientSaltHash, {
						value: withdrawalAmount,
					})

					const withdrawal = {
						recipient: user.address,
						tokenIndex: 0, // Assuming 0 is the index for native token
						amount: withdrawalAmount,
						id: 1,
					}

					const withdrawalHash = getWithdrawalHash(withdrawal)

					// Process the withdrawal to make it claimable
					await scrollMessenger.processWithdrawals(0, [], 0, [withdrawalHash])

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
					const { liquidity, scrollMessenger } = await loadFixture(setup)
					const { user } = await getSigners()

					const testERC20Factory = await ethers.getContractFactory('TestERC20')
					const testERC20 = await testERC20Factory.deploy(user.address)

					const withdrawalAmount = ethers.parseEther('100')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))

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
						id: 1,
					}

					const withdrawalHash = getWithdrawalHash(withdrawal)
					await scrollMessenger.processWithdrawals(0, [], 0, [withdrawalHash])

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
					const { liquidity, scrollMessenger } = await loadFixture(setup)
					const { deployer, user } = await getSigners()

					const testNFTFactory = await ethers.getContractFactory('TestNFT')
					const testNFT = await testNFTFactory.deploy()

					const tokenId = 1
					await testNFT.transferFrom(deployer.address, user.address, tokenId)
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))

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
						id: 1,
					}

					const withdrawalHash = getWithdrawalHash(withdrawal)
					await scrollMessenger.processWithdrawals(0, [], 0, [withdrawalHash])

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
					const { liquidity, scrollMessenger } = await loadFixture(setup)
					const { user } = await getSigners()

					const testERC1155Factory =
						await ethers.getContractFactory('TestERC1155')
					const testERC1155 = await testERC1155Factory.deploy()

					const tokenId = 1
					const amount = 100
					await testERC1155.mint(user.address, tokenId, amount, '0x')
					const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))

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
						id: 1,
					}

					const withdrawalHash = getWithdrawalHash(withdrawal)
					await scrollMessenger.processWithdrawals(0, [], 0, [withdrawalHash])

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
				const { liquidity, scrollMessenger } = await loadFixture(setup)
				const { user } = await getSigners()

				// First, create a claimable withdrawal
				const withdrawalAmount = ethers.parseEther('1')
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash, { value: withdrawalAmount })

				const withdrawal = {
					recipient: user.address,
					tokenIndex: 0, // Assuming 0 is the index for native token
					amount: withdrawalAmount,
					id: 1,
				}

				const withdrawalHash = getWithdrawalHash(withdrawal)

				// Process the withdrawal to make it claimable
				await scrollMessenger.processWithdrawals(0, [], 0, [withdrawalHash])

				// Now claim the withdrawal
				await expect(liquidity.connect(user).claimWithdrawals([withdrawal]))
					.to.emit(liquidity, 'ClaimedWithdrawal')
					.withArgs(user.address, withdrawalHash)
			})
			it('emit ClaimedWithdrawal for multiple withdrawals', async () => {
				const { liquidity, scrollMessenger } = await loadFixture(setup)
				const { user } = await getSigners()

				// Create two claimable withdrawals
				const withdrawalAmount1 = ethers.parseEther('1')
				const withdrawalAmount2 = ethers.parseEther('2')
				const recipientSaltHash1 = ethers.keccak256(ethers.toUtf8Bytes('test1'))
				const recipientSaltHash2 = ethers.keccak256(ethers.toUtf8Bytes('test2'))

				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash1, { value: withdrawalAmount1 })
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash2, { value: withdrawalAmount2 })

				const withdrawal1 = {
					recipient: user.address,
					tokenIndex: 0,
					amount: withdrawalAmount1,
					id: 1,
				}

				const withdrawal2 = {
					recipient: user.address,
					tokenIndex: 0,
					amount: withdrawalAmount2,
					id: 2,
				}

				const withdrawalHash1 = getWithdrawalHash(withdrawal1)
				const withdrawalHash2 = getWithdrawalHash(withdrawal2)

				// Process both withdrawals to make them claimable
				await scrollMessenger.processWithdrawals(0, [], 0, [
					withdrawalHash1,
					withdrawalHash2,
				])

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
				const { liquidity } = await loadFixture(setup)
				const { user } = await getSigners()

				// Create a withdrawal object that hasn't been processed
				const nonExistentWithdrawal = {
					recipient: user.address,
					tokenIndex: 0, // Assuming 0 is for native token
					amount: ethers.parseEther('1'),
					id: 9999, // Use a high number to ensure it doesn't exist
				}

				const withdrawalHash = getWithdrawalHash(nonExistentWithdrawal)

				// Attempt to claim the non-existent withdrawal
				await expect(
					liquidity.connect(user).claimWithdrawals([nonExistentWithdrawal]),
				)
					.to.be.revertedWithCustomError(liquidity, 'WithdrawalNotFound')
					.withArgs(withdrawalHash)
			})
			it('rejects duplicate withdrawal claims', async () => {
				const { liquidity, scrollMessenger } = await loadFixture(setup)
				const { user } = await getSigners()

				// Create a claimable withdrawal
				const withdrawalAmount = ethers.parseEther('1')
				const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
				await liquidity.depositNativeToken(recipientSaltHash, {
					value: withdrawalAmount,
				})

				const withdrawal = {
					recipient: user.address,
					tokenIndex: 0, // Assuming 0 is the index for native token
					amount: withdrawalAmount,
					id: 1,
				}

				const withdrawalHash = getWithdrawalHash(withdrawal)

				// Process the withdrawal to make it claimable
				await scrollMessenger.processWithdrawals(0, [], 0, [withdrawalHash])

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

			for (let i = 0; i < 5; i++) {
				const recipientSaltHash = ethers.keccak256(
					ethers.toUtf8Bytes(`test${i}`),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash, { value: depositAmount })
			}

			const depositData0 = await liquidity.getDepositData(1)
			const depositHash0 = getDepositHash(
				ethers.keccak256(ethers.toUtf8Bytes('test0')),
				0,
				depositAmount,
			)

			expect(depositData0.depositHash).to.equal(depositHash0)
			expect(depositData0.sender).to.equal(user.address)
			expect(depositData0.isRejected).to.equal(false)

			const depositData2 = await liquidity.getDepositData(3)
			const depositHash2 = getDepositHash(
				ethers.keccak256(ethers.toUtf8Bytes('test2')),
				0,
				depositAmount,
			)

			expect(depositData2.depositHash).to.equal(depositHash2)
			expect(depositData2.sender).to.equal(user.address)
			expect(depositData2.isRejected).to.equal(false)
		})
	})

	describe('getDepositDataHash', () => {
		it('get getDepositDataHash', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()

			// Create some deposits using ETH
			const depositAmount = ethers.parseEther('1')

			for (let i = 0; i < 5; i++) {
				const recipientSaltHash = ethers.keccak256(
					ethers.toUtf8Bytes(`test${i}`),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash, { value: depositAmount })
			}

			const depositDataHash0 = await liquidity.getDepositDataHash(1)
			const depositHash0 = getDepositHash(
				ethers.keccak256(ethers.toUtf8Bytes('test0')),
				0,
				depositAmount,
			)

			expect(depositDataHash0).to.equal(depositHash0)

			const depositDataHash2 = await liquidity.getDepositDataHash(3)
			const depositHash2 = getDepositHash(
				ethers.keccak256(ethers.toUtf8Bytes('test2')),
				0,
				depositAmount,
			)

			expect(depositDataHash2).to.equal(depositHash2)
		})
	})

	describe('getLastRelayedDepositId, getLastDepositId', () => {
		it('get DepositId', async () => {
			const { liquidity } = await loadFixture(setup)
			const { analyzer, user } = await getSigners()

			expect(await liquidity.getLastRelayedDepositId()).to.equal(0)
			expect(await liquidity.getLastDepositId()).to.equal(0)

			// Create some deposits using ETH
			const depositAmount = ethers.parseEther('1')

			for (let i = 0; i < 5; i++) {
				const recipientSaltHash = ethers.keccak256(
					ethers.toUtf8Bytes(`test${i}`),
				)
				await liquidity
					.connect(user)
					.depositNativeToken(recipientSaltHash, { value: depositAmount })
			}

			expect(await liquidity.getLastRelayedDepositId()).to.equal(0)
			expect(await liquidity.getLastDepositId()).to.equal(5)

			await liquidity.connect(analyzer).analyzeAndRelayDeposits(3, [], 1000000)

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

			const currentDepositId = await liquidity.getLastDepositId()
			await liquidity
				.connect(user)
				.depositNativeToken(recipientSaltHash, { value: depositAmount })
			const result = await liquidity.isDepositValid(
				currentDepositId + 1n,
				recipientSaltHash,
				0, // tokenIndex for ETH should be 0
				depositAmount,
				user.address,
			)
			expect(result).to.equal(true)
		})
		it('return false(depositHash)', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()
			const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const depositAmount = ethers.parseEther('1')

			const currentDepositId = await liquidity.getLastDepositId()
			await liquidity
				.connect(user)
				.depositNativeToken(recipientSaltHash, { value: depositAmount })
			const result = await liquidity.isDepositValid(
				currentDepositId + 1n,
				recipientSaltHash,
				0, // tokenIndex for ETH should be 0
				depositAmount + 1n,
				user.address,
			)
			expect(result).to.equal(false)
		})
		it('return false(address)', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user } = await getSigners()
			const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const depositAmount = ethers.parseEther('1')

			const currentDepositId = await liquidity.getLastDepositId()
			await liquidity
				.connect(user)
				.depositNativeToken(recipientSaltHash, { value: depositAmount })
			const result = await liquidity.isDepositValid(
				currentDepositId + 1n,
				recipientSaltHash,
				0, // tokenIndex for ETH should be 0
				depositAmount,
				ethers.ZeroAddress,
			)
			expect(result).to.equal(false)
		})
		it('return false(isRejected)', async () => {
			const { liquidity } = await loadFixture(setup)
			const { user, analyzer } = await getSigners()
			const recipientSaltHash = ethers.keccak256(ethers.toUtf8Bytes('test'))
			const depositAmount = ethers.parseEther('1')

			await liquidity
				.connect(user)
				.depositNativeToken(recipientSaltHash, { value: depositAmount })
			await liquidity
				.connect(analyzer)
				.analyzeAndRelayDeposits(1, [1], 1000000, {
					value: ethers.parseEther('1'),
				})
			const result = await liquidity.isDepositValid(
				1,
				recipientSaltHash,
				0, // tokenIndex for ETH should be 0
				depositAmount,
				user.address,
			)
			expect(result).to.equal(false)
		})
	})
	describe('upgrade', () => {
		it('channel contract is upgradable', async () => {
			const { liquidity } = await loadFixture(setup)
			const liquidity2Factory =
				await ethers.getContractFactory('Liquidity2Test')
			const next = await upgrades.upgradeProxy(
				await liquidity.getAddress(),
				liquidity2Factory,
				{ unsafeAllow: ['constructor'] },
			)
			const beforeRole = await liquidity.ANALYZER()

			const afterRole = await next.ANALYZER()
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
