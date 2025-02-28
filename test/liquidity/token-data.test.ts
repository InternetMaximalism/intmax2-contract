import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

import { TokenDataTest } from '../../typechain-types'

import { INITIAL_ERC20_TOKEN_ADDRESSES, TokenType } from './common.test'

describe('TokenData', () => {
	const setup = async (): Promise<TokenDataTest> => {
		const tokenDataFactory = await ethers.getContractFactory('TokenDataTest')
		const tokenData =
			(await tokenDataFactory.deploy()) as unknown as TokenDataTest
		await tokenData.initialize(INITIAL_ERC20_TOKEN_ADDRESSES)
		return tokenData
	}

	describe('initialize', () => {
		describe('success', () => {
			it('should store information for NATIVE token and two ERC20 tokens', async () => {
				const tokenData = await loadFixture(setup)
				const nativeTokenInfo = await tokenData.getTokenInfo(0)
				expect(nativeTokenInfo.tokenType).to.equal(TokenType.NATIVE)
				expect(nativeTokenInfo.tokenAddress).to.equal(ethers.ZeroAddress)
				expect(nativeTokenInfo.tokenId).to.equal(0)

				for (let i = 0; i < INITIAL_ERC20_TOKEN_ADDRESSES.length; i++) {
					const [exists, tokenIndex] = await tokenData.getTokenIndex(
						TokenType.ERC20,
						INITIAL_ERC20_TOKEN_ADDRESSES[i],
						0,
					)
					expect(exists).to.be.true
					const tokenInfo = await tokenData.getTokenInfo(tokenIndex)
					expect(tokenInfo.tokenType).to.equal(TokenType.ERC20)
					expect(tokenInfo.tokenAddress).to.equal(
						INITIAL_ERC20_TOKEN_ADDRESSES[i],
					)
					expect(tokenInfo.tokenId).to.equal(0)
				}
			})
		})
		describe('fail', () => {
			it('should revert when trying to reinitialize', async () => {
				const tokenData = await loadFixture(setup)
				await expect(tokenData.initialize([])).to.be.revertedWithCustomError(
					tokenData,
					'InvalidInitialization',
				)
			})
		})
	})
	describe('getOrCreateTokenIndex', () => {
		it('should return existing token index if token information already exists', async () => {
			const tokenData = await loadFixture(setup)
			expect(await tokenData.latestTokenIndex()).to.equal(0)
			await tokenData.getOrCreateTokenIndex(
				TokenType.ERC20,
				INITIAL_ERC20_TOKEN_ADDRESSES[0],
				0,
			)
			expect(await tokenData.latestTokenIndex()).to.equal(1)
		})
		describe('when token information does not exist', () => {
			describe('success', () => {
				it('should create new token information (ERC20)', async () => {
					const tokenData = await loadFixture(setup)
					const newERC20Address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
					await tokenData.getOrCreateTokenIndex(
						TokenType.ERC20,
						newERC20Address,
						0,
					)
					const tokenInfo = await tokenData.getTokenInfo(3)
					expect(tokenInfo.tokenType).to.equal(TokenType.ERC20)
					expect(tokenInfo.tokenAddress).to.equal(newERC20Address)
					expect(tokenInfo.tokenId).to.equal(0)
				})
				it('should create new token information (ERC721)', async () => {
					const tokenData = await loadFixture(setup)
					const newERC721Address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
					const tokenId = 1
					await tokenData.getOrCreateTokenIndex(
						TokenType.ERC721,
						newERC721Address,
						tokenId,
					)
					const tokenInfo = await tokenData.getTokenInfo(3)
					expect(tokenInfo.tokenType).to.equal(TokenType.ERC721)
					expect(tokenInfo.tokenAddress).to.equal(newERC721Address)
					expect(tokenInfo.tokenId).to.equal(tokenId)
				})
				it('should create new token information (ERC1155)', async () => {
					const tokenData = await loadFixture(setup)
					const newERC1155Address = '0x76BE3b62873462d2142405439777e971754E8E77'
					const tokenId = 1
					await tokenData.getOrCreateTokenIndex(
						TokenType.ERC1155,
						newERC1155Address,
						tokenId,
					)
					const tokenInfo = await tokenData.getTokenInfo(3)
					expect(tokenInfo.tokenType).to.equal(TokenType.ERC1155)
					expect(tokenInfo.tokenAddress).to.equal(newERC1155Address)
					expect(tokenInfo.tokenId).to.equal(tokenId)
				})
			})
			describe('fail', () => {
				it('should revert with TokenAddressIsZero if tokenAddress is 0', async () => {
					const tokenData = await loadFixture(setup)
					await expect(
						tokenData.getOrCreateTokenIndex(
							TokenType.ERC20,
							ethers.ZeroAddress,
							0,
						),
					).to.be.revertedWithCustomError(tokenData, 'TokenAddressIsZero')
				})
			})
		})
	})
	describe('getNativeTokenIndex', () => {
		it('should return the index of the native token', async () => {
			const tokenData = await loadFixture(setup)
			const nativeTokenIndex = await tokenData.getNativeTokenIndex()
			expect(nativeTokenIndex).to.equal(0)
		})
	})
	describe('getTokenIndex', () => {
		describe('success', () => {
			it('should retrieve NATIVE token information', async () => {
				const tokenData = await loadFixture(setup)
				const [exists, tokenIndex] = await tokenData.getTokenIndex(
					TokenType.NATIVE,
					ethers.ZeroAddress,
					0,
				)
				expect(exists).to.be.true
				expect(tokenIndex).to.equal(0)
			})
			it('should retrieve ERC20 token information', async () => {
				const tokenData = await loadFixture(setup)
				const [exists, tokenIndex] = await tokenData.getTokenIndex(
					TokenType.ERC20,
					INITIAL_ERC20_TOKEN_ADDRESSES[0],
					0,
				)
				expect(exists).to.be.true
				expect(tokenIndex).to.equal(1)
			})
			it('should retrieve ERC721 token information', async () => {
				const tokenData = await loadFixture(setup)
				const newERC721Address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
				const tokenId = 1
				await tokenData.getOrCreateTokenIndex(
					TokenType.ERC721,
					newERC721Address,
					tokenId,
				)
				const [exists, tokenIndex] = await tokenData.getTokenIndex(
					TokenType.ERC721,
					newERC721Address,
					tokenId,
				)
				expect(exists).to.be.true
				expect(tokenIndex).to.equal(3)
			})
			it('should retrieve ERC1155 token information', async () => {
				const tokenData = await loadFixture(setup)
				const newERC1155Address = '0x76BE3b62873462d2142405439777e971754E8E77'
				const tokenId = 1
				await tokenData.getOrCreateTokenIndex(
					TokenType.ERC1155,
					newERC1155Address,
					tokenId,
				)
				const [exists, tokenIndex] = await tokenData.getTokenIndex(
					TokenType.ERC1155,
					newERC1155Address,
					tokenId,
				)
				expect(exists).to.be.true
				expect(tokenIndex).to.equal(3)
			})
			it('should not retrieve non-existent information', async () => {
				const tokenData = await loadFixture(setup)
				const [exists, tokenIndex] = await tokenData.getTokenIndex(
					TokenType.ERC20,
					'0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
					0,
				)
				expect(exists).to.be.false
				expect(tokenIndex).to.equal(0)
			})
		})
		describe('fail', () => {
			it('should revert with TokenAddressIsZero when specifying 0 address', async () => {
				const tokenData = await loadFixture(setup)
				await expect(
					tokenData.getTokenIndex(TokenType.ERC20, ethers.ZeroAddress, 0),
				).to.be.revertedWithCustomError(tokenData, 'TokenAddressIsZero')
			})
		})
	})
})
