import { ethers, } from 'hardhat'
import { readDeployedContracts } from '../utils/io'


async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.testErc20 || !deployedContracts.liquidity) {
		throw new Error('testErc20 and liquidity contract should be deployed')
	}
	const token = await ethers.getContractAt(
		'TestERC20',
		deployedContracts.testErc20,
	)
	const signer = (await ethers.getSigners())[0]
	const balance = await token.balanceOf(signer.address)
	console.log('Balance:', ethers.formatEther(balance))

	const tx = await token.transfer(deployedContracts.liquidity, balance)
	console.log('Transfer tx:', tx.hash)
	await tx.wait()

	const balanceAfter = await token.balanceOf(signer.address)
	console.log('Balance after:', ethers.formatEther(balanceAfter))
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
