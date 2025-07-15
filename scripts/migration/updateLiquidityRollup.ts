import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'
import { Liquidity } from '../../typechain-types/contracts/Liquidity'
import { getCounterPartNetwork } from '../utils/counterPartNetwork'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

async function main() {
	let deployedL2Contracts = await readDeployedContracts()
	let deployedL1Contracts = await readDeployedContracts(getCounterPartNetwork())

	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	if (!deployedL1Contracts.liquidity)
		throw new Error('Liquidity contract is not deployed on L1s')
	if (!deployedL2Contracts.rollup)
		throw new Error('Rollup contract is not deployed on L2s')

	const liquidity = (await ethers.getContractAt(
		'Liquidity',
		deployedL1Contracts.liquidity,
		signer,
	)) as unknown as Liquidity

	const tx = await liquidity.updateRollupContract(deployedL2Contracts.rollup)
	await tx.wait()
	console.log(
		`Liquidity contract updated to point to rollup at ${deployedL2Contracts.rollup} by tx ${tx.hash}`,
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
