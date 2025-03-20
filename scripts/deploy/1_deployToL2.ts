import { ethers, network, upgrades } from 'hardhat'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import { sleep } from '../../utils/sleep'
import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
	ADMIN_ADDRESS: str(),
	SLEEP_TIME: num({
		default: 30,
	}),
})

async function main() {
	let admin = env.ADMIN_ADDRESS
	if (network.name === 'localhost') {
		admin = (await ethers.getSigners())[0].address
	}

	const deployedContracts = await readDeployedContracts()

	if (!deployedContracts.rollup) {
		console.log('deploying rollup')
		const rollupFactory = await ethers.getContractFactory('Rollup')
		const rollup = await upgrades.deployProxy(rollupFactory, [], {
			initializer: false,
			kind: 'uups',
		})
		const deployedContracts = await readDeployedContracts()
		const newContractAddresses = {
			rollup: await rollup.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(newContractAddresses)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedContracts.blockBuilderRegistry) {
		console.log('deploying blockBuilderRegistry')
		const blockBuilderRegistryFactory = await ethers.getContractFactory(
			'BlockBuilderRegistry',
		)
		const blockBuilderRegistry = await upgrades.deployProxy(
			blockBuilderRegistryFactory,
			[],
			{
				initializer: false,
				kind: 'uups',
			},
		)
		const deployedContracts = await readDeployedContracts()
		const newContractAddresses = {
			blockBuilderRegistry: await blockBuilderRegistry.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(newContractAddresses)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedContracts.withdrawal) {
		console.log('deploying withdrawal')
		const withdrawalFactory = await ethers.getContractFactory('Withdrawal')
		const withdrawal = await upgrades.deployProxy(withdrawalFactory, [], {
			initializer: false,
			kind: 'uups',
		})
		const deployedContracts = await readDeployedContracts()
		const newContractAddresses = {
			withdrawal: await withdrawal.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(newContractAddresses)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedContracts.claim) {
		console.log('deploying claim')
		const claimFactory = await ethers.getContractFactory('Claim')
		const claim = await upgrades.deployProxy(claimFactory, [], {
			initializer: false,
			kind: 'uups',
		})
		const deployedContracts = await readDeployedContracts()
		const newContractAddresses = {
			claim: await claim.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(newContractAddresses)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedContracts.l2Contribution) {
		console.log('deploying l2Contribution')
		const contributionFactory = await ethers.getContractFactory('Contribution')
		const l2Contribution = await upgrades.deployProxy(
			contributionFactory,
			[admin],
			{
				kind: 'uups',
			},
		)
		const deployedContracts = await readDeployedContracts()
		const newContractAddresses = {
			l2Contribution: await l2Contribution.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(newContractAddresses)
		await sleep(env.SLEEP_TIME)
	}

	let WithdrawalPlonkVerifier_
	let ClaimPlonkVerifier_
	if (network.name === 'localhost') {
		WithdrawalPlonkVerifier_ =
			await ethers.getContractFactory('MockPlonkVerifier')
		ClaimPlonkVerifier_ = await ethers.getContractFactory('MockPlonkVerifier')
	} else {
		WithdrawalPlonkVerifier_ = await ethers.getContractFactory(
			'WithdrawalPlonkVerifier',
		)
		ClaimPlonkVerifier_ = await ethers.getContractFactory('ClaimPlonkVerifier')
	}

	if (!deployedContracts.withdrawalPlonkVerifier) {
		console.log('deploying withdrawalPlonkVerifier')
		const withdrawalVerifier = await WithdrawalPlonkVerifier_.deploy()
		const deployedContracts = await readDeployedContracts()
		const newContractAddresses = {
			withdrawalPlonkVerifier: await withdrawalVerifier.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(newContractAddresses)
		await sleep(env.SLEEP_TIME)
	}

	if (!deployedContracts.claimPlonkVerifier) {
		console.log('deploying claimPlonkVerifier')
		const claimVerifier = await ClaimPlonkVerifier_.deploy()
		const deployedContracts = await readDeployedContracts()
		const newContractAddresses = {
			claimPlonkVerifier: await claimVerifier.getAddress(),
			...deployedContracts,
		}
		await writeDeployedContracts(newContractAddresses)
		await sleep(env.SLEEP_TIME)
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
