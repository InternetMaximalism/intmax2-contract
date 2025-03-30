import { ethers, network } from 'hardhat'

async function main() {
	const TestERC721 = await ethers.getContractFactory('TestNFT')
	const testErc20 = await TestERC721.deploy()
	console.log('Test ERC721 deployed to:', await testErc20.getAddress())
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
