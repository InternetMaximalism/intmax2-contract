import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'
import { Withdrawal } from '../../typechain-types/contracts/Withdrawal'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
})

async function main() {
	let deployedL2Contracts = await readDeployedContracts()
	if (!deployedL2Contracts.withdrawal) {
		throw new Error('Withdrawal contract is not deployed on L2')
	}
	const withdrawal = (await ethers.getContractAt(
		'Withdrawal',
		deployedL2Contracts.withdrawal,
	)) as unknown as Withdrawal

	
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
