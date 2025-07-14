import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'
import { Rollup } from '../../typechain-types/contracts/Rollup'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
})

async function main() {
	let deployedL2Contracts = await readDeployedContracts()
	if (!deployedL2Contracts.rollup) {
		throw new Error('Rollup contract is not deployed on L2')
	}
	const rollup = (await ethers.getContractAt(
		'Rollup',
		deployedL2Contracts.rollup,
	)) as unknown as Rollup

    
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
