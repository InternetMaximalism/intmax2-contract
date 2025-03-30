import { ethers, network } from 'hardhat'

async function main() {
	const TestERC20 = await ethers.getContractFactory('TestERC20')
	const owner = (await ethers.getSigners())[0]
	const testErc20 = await TestERC20.deploy(owner.address)
	console.log('Test ERC20 deployed to:', await testErc20.getAddress())
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
