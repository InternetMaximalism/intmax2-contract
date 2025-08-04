import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'
import { Contribution } from '../../typechain-types/contracts/Contribution'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
})

async function main() {
	const deployed = await readDeployedContracts()

	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	if (
		!deployed.l2Contribution ||
		!deployed.rollup ||
		!deployed.withdrawal ||
		!deployed.claim
	) {
		throw new Error('Required contracts are not deployed on L2')
	}

	const contribution = (await ethers.getContractAt(
		'Contribution',
		deployed.l2Contribution,
		signer,
	)) as unknown as Contribution

	const contributorRole = await contribution.CONTRIBUTOR()

	const grantRoleForRollupTx = await contribution.grantRole(
		contributorRole,
		deployed.rollup,
	)
	await grantRoleForRollupTx.wait()
	console.log(
		`Granted CONTRIBUTOR role to Rollup contract at transaction: ${grantRoleForRollupTx.hash}`,
	)

	const grantRoleForWithdrawalTx = await contribution.grantRole(
		contributorRole,
		deployed.withdrawal,
	)
	await grantRoleForWithdrawalTx.wait()
	console.log(
		`Granted CONTRIBUTOR role to Withdrawal contract at transaction: ${grantRoleForWithdrawalTx.hash}`,
	)

	const grantRoleForClaimTx = await contribution.grantRole(
		contributorRole,
		deployed.claim,
	)
	await grantRoleForClaimTx.wait()
	console.log(
		`Granted CONTRIBUTOR role to Claim contract at transaction: ${grantRoleForClaimTx.hash}`,
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
