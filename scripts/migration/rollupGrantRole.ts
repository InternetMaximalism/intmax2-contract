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
	let deployedL1Contracts = await readDeployedContracts()
	let deployedL2Contracts = await readDeployedContracts(getCounterPartNetwork())

	if (!deployedL1Contracts.liquidity) {
		throw new Error('Liquidity contract is not deployed on L1')
	}
	if (!deployedL2Contracts.withdrawal || !deployedL2Contracts.claim) {
		throw new Error('Withdrawal or Claim contract is not deployed on L2')
	}
	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)

	const liquidity = (await ethers.getContractAt(
		'Liquidity',
		deployedL1Contracts.liquidity,
		signer,
	)) as unknown as Liquidity

	const withdrawalRole = await liquidity.WITHDRAWAL()

	const grantRoleForWithdrawalTx = await liquidity.grantRole(
		withdrawalRole,
		deployedL2Contracts.withdrawal,
	)
	await grantRoleForWithdrawalTx.wait()
	console.log(
		`Granted WITHDRAWAL role to Withdrawal contract at transaction: ${grantRoleForWithdrawalTx.hash}`,
	)

	const grantRoleForClaimTx = await liquidity.grantRole(
		withdrawalRole,
		deployedL2Contracts.claim,
	)
	await grantRoleForClaimTx.wait()
	console.log(
		`Granted WITHDRAWAL role to Claim contract at transaction: ${grantRoleForClaimTx.hash}`,
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
