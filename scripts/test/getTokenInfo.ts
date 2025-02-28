import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.liquidity) {
		throw new Error('liquidity contract should not be deployed')
	}
	const liquidity = await ethers.getContractAt(
		'Liquidity',
		deployedContracts.liquidity,
	)
	const tokenIndex = '1'
	console.log('tokenIndex:', tokenIndex)

	const tokenInfo = await liquidity.getTokenInfo(tokenIndex)
	console.log('token info:', tokenInfo)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
