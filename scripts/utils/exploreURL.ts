import { DeployedContracts } from '../schema/deployedContractsSchema'
import { getCounterPartNetwork } from './counterPartNetwork'
import { readDeployedContracts } from './io'

async function main() {
	const deployedL1Contracts = await readDeployedContracts()
	if (
		!deployedL1Contracts.mockL1ScrollMessenger ||
		!deployedL1Contracts.testErc20 ||
		!deployedL1Contracts.liquidity
	) {
		throw new Error('all l1 contracts should be deployed')
	}

	const deployedL2Contracts = await readDeployedContracts(
		getCounterPartNetwork(),
	)
	if (
		!deployedL2Contracts.rollup ||
		!deployedL2Contracts.withdrawal ||
		!deployedL2Contracts.blockBuilderRegistry ||
		!deployedL2Contracts.withdrawalPlonkVerifier 
	) {
		throw new Error('all l2 contracts should be deployed')
	}

	console.log('----------L1 contracts----------')

	const l1Contracts = ['mockL1ScrollMessenger', 'testErc20', 'liquidity']

	// l1 contracts
	for (const contract of l1Contracts) {
		const address = deployedL1Contracts[contract as keyof DeployedContracts]
		if (!address) {
			throw new Error(`${contract} should be deployed`)
		}
		const url = `https://sepolia.etherscan.io/address/${address}`
		console.log(`${contract}: ${url}`)
	}

	console.log('\n----------L2 contracts----------')

	const l2Contracts = [
		'mockL2ScrollMessenger',
		'rollup',
		'withdrawal',
		'blockBuilderRegistry',
		'withdrawalPlonkVerifier',
	]

	// l2 contracts
	for (const contract of l2Contracts) {
		const address = deployedL2Contracts[contract as keyof DeployedContracts]
		if (!address) {
			throw new Error(`${contract} should be deployed`)
		}
		const url = `https://sepolia.scrollscan.com/address/${address}`
		console.log(`${contract}: ${url}`)
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
