import { ethers } from 'hardhat'

async function main() {
	console.log('deploying Liquidity implementation')
	const liquidityFactory = await ethers.getContractFactory('Liquidity')
	const liquidityImpl = await liquidityFactory.deploy()
	// await liquidityImpl.waitForDeployment()
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
