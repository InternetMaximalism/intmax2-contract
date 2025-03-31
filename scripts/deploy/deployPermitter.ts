import { ethers, upgrades } from 'hardhat'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import { cleanEnv, str } from 'envalid'
import { Liquidity } from '../../typechain-types/contracts/Liquidity'

const env = cleanEnv(process.env, {
	ADMIN_PRIVATE_KEY: str(),
	ADMIN_ADDRESS: str(),
	PREDICATE_AML_POLICY_ID: str(),
	PREDICATE_AML_SERVICE_MANAGER: str(),
	PREDICATE_ELIGIBILITY_POLICY_ID: str(),
	PREDICATE_ELIGIBILITY_SERVICE_MANAGER: str(),
})

async function main() {
	let deployedContracts = await readDeployedContracts()

	if (!deployedContracts.amlPermitter) {
		console.log('deploying amlPermitter')
		const predicatePermitterFactory =
			await ethers.getContractFactory('PredicatePermitter')
		const amlPermitter = await upgrades.deployProxy(
			predicatePermitterFactory,
			[
				env.ADMIN_ADDRESS,
				env.PREDICATE_AML_SERVICE_MANAGER,
				env.PREDICATE_AML_POLICY_ID,
			],
			{
				kind: 'uups',
			},
		)
		deployedContracts = {
			amlPermitter: await amlPermitter.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(deployedContracts)
	}

	if (!deployedContracts.eligibilityPermitter) {
		console.log('deploying eligibilityPermitter')
		const predicatePermitterFactory =
			await ethers.getContractFactory('PredicatePermitter')
		const eligibilityPermitter = await upgrades.deployProxy(
			predicatePermitterFactory,
			[
				env.ADMIN_ADDRESS,
				env.PREDICATE_ELIGIBILITY_SERVICE_MANAGER,
				env.PREDICATE_ELIGIBILITY_POLICY_ID,
			],
			{
				kind: 'uups',
			},
		)
		deployedContracts = {
			eligibilityPermitter: await eligibilityPermitter.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(deployedContracts)
	}

	if (!deployedContracts.liquidity) {
		throw new Error('liquidity should be deployed')
	}

	if (env.ADMIN_PRIVATE_KEY === '') {
		throw new Error('ADMIN_PRIVATE_KEY is required')
	}
	const admin = new ethers.Wallet(env.ADMIN_PRIVATE_KEY, ethers.provider)
	if (admin.address !== env.ADMIN_ADDRESS) {
		throw new Error('ADMIN_ADDRESS and ADMIN_PRIVATE_KEY do not match')
	}

	const liquidity = await ethers.getContractAt(
		'Liquidity',
		deployedContracts.liquidity,
	)
	const txSetPermitter = await (
		liquidity.connect(admin) as Liquidity
	).setPermitter(
		deployedContracts.amlPermitter!,
		deployedContracts.eligibilityPermitter!,
	)
	console.log('setPermitter tx hash:', txSetPermitter.hash)
	const resSetPermitter = await txSetPermitter.wait()
	if (resSetPermitter?.status !== 1) {
		throw new Error('Tx not successful')
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
