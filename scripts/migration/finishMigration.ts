import { str } from 'envalid'
import { cleanEnv } from 'envalid/dist/envalid'
import { ethers } from 'hardhat'

import { BlockBuilderRegistry } from '../../typechain-types/contracts/block-builder-registry/BlockBuilderRegistry'
import { Claim } from '../../typechain-types/contracts/Claim'
import { Rollup } from '../../typechain-types/contracts/Rollup'
import { Withdrawal } from '../../typechain-types/contracts/Withdrawal'
import { readDeployedContracts } from '../utils/io'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
	NEW_ADMIN: str(),
})

async function main() {
	const deployed = await readDeployedContracts()
	if (
		!deployed.rollup ||
		!deployed.withdrawal ||
		!deployed.claim ||
		!deployed.blockBuilderRegistry
	) {
		throw new Error('Required contracts are not deployed on L2')
	}
	const signer = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)

	const rollup = (await ethers.getContractAt(
		'Rollup',
		deployed.rollup,
		signer,
	)) as unknown as Rollup
	const finishRollupTx = await rollup.finishMigration()
	await finishRollupTx.wait()
	console.log(`✅ Rollup migration finished: ${finishRollupTx.hash}`)

	const transferOwnerRollupTx = await rollup.transferOwnership(env.NEW_ADMIN)
	await transferOwnerRollupTx.wait()
	console.log(`✅ Rollup ownership transferred to: ${env.NEW_ADMIN}`)

	const withdrawal = (await ethers.getContractAt(
		'Withdrawal',
		deployed.withdrawal,
		signer,
	)) as unknown as Withdrawal
	const finishWithdrawalTx = await withdrawal.finishMigration()
	await finishWithdrawalTx.wait()
	console.log(`✅ Withdrawal migration finished: ${finishWithdrawalTx.hash}`)

	const transferOwnerWithdrawalTx = await withdrawal.transferOwnership(
		env.NEW_ADMIN,
	)
	await transferOwnerWithdrawalTx.wait()
	console.log(`✅ Withdrawal ownership transferred to: ${env.NEW_ADMIN}`)

	const claim = (await ethers.getContractAt(
		'Claim',
		deployed.claim,
		signer,
	)) as unknown as Claim
	const finishClaimTx = await claim.finishMigration()
	await finishClaimTx.wait()
	console.log(`✅ Claim migration finished: ${finishClaimTx.hash}`)

	const transferOwnerClaimTx = await claim.transferOwnership(env.NEW_ADMIN)
	await transferOwnerClaimTx.wait()
	console.log(`✅ Claim ownership transferred to: ${env.NEW_ADMIN}`)

	const blockBuilderRegistry = (await ethers.getContractAt(
		'BlockBuilderRegistry',
		deployed.blockBuilderRegistry,
		signer,
	)) as unknown as BlockBuilderRegistry

	const transferOwnerRegistryTx = await blockBuilderRegistry.transferOwnership(
		env.NEW_ADMIN,
	)
	await transferOwnerRegistryTx.wait()
	console.log(
		`✅ BlockBuilderRegistry ownership transferred to: ${env.NEW_ADMIN}`,
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
