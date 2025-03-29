import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { cleanEnv, str } from 'envalid'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	PREDICATE_AML_POLICY_ID: str({
		default: 'x-strict-membership-policy',
	}),
	PREDICATE_AML_SERVICE_MANAGER: str({
		default: '0xcb397f4bDF93213851Ef1c84439Dd3497Dff66c1',
	}),
})

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.amlPermitter) {
		throw new Error('amlPermitter contract should not be deployed')
	}
	const amlPermitter = await ethers.getContractAt(
		'PredicatePermitter',
		deployedContracts.amlPermitter,
	)

	const user = (await ethers.getSigners())[0]
	const balance = await ethers.provider.getBalance(user.address)
	console.log('balance:', balance.toString())

	const policyId = env.PREDICATE_AML_POLICY_ID
	const tx = await amlPermitter.connect(user).setPolicy(policyId)
	console.log('setPolicy tx hash:', tx.hash)
	const res = await tx.wait()
	if (!res?.blockNumber) {
		throw new Error('No block number found')
	}

	const serviceManager = env.PREDICATE_AML_SERVICE_MANAGER
	const txSetPredicateManager = await amlPermitter
		.connect(user)
		.setPredicateManager(serviceManager)
	console.log('setPredicateManager tx hash:', txSetPredicateManager.hash)
	const resSetPredicateManager = await txSetPredicateManager.wait()
	if (!resSetPredicateManager?.blockNumber) {
		throw new Error('No block number found')
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
