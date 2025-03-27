import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { cleanEnv, str } from 'envalid'

const env = cleanEnv(process.env, {
	RELAYER_PRIVATE_KEY: str(),
})

async function main() {
	const relayer = new ethers.Wallet(env.RELAYER_PRIVATE_KEY, ethers.provider)
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.liquidity) {
		throw new Error('liquidity contracts should be deployed')
	}
	const liquidity = await ethers.getContractAt(
		'Liquidity',
		deployedContracts.liquidity,
	)
	const lastRelayedDepositId = await liquidity.getLastRelayedDepositId()
	const lastDepositId = await liquidity.getLastDepositId()
	console.log('lastRelayedDepositId:', lastRelayedDepositId)
	console.log('lastDepositId:', lastDepositId)
	const numDepositsToRelay = lastDepositId - lastRelayedDepositId
	console.log('number of deposits to relay:', numDepositsToRelay)

	// The estimated gas limit is about 220k + 20k * numDeposits.
	const buffer = 100_000n
	const gasLimit = 220_000n + 20_000n * numDepositsToRelay + buffer
	try {
		const tx = await liquidity
			.connect(relayer)
			.relayDeposits(lastDepositId, gasLimit, {
				value: ethers.parseEther('0.1'), // will be refunded
			})
		console.log('relayDeposits tx hash:', tx.hash)
		await tx.wait()
	} catch (error: any) {
		console.log('error', error)
		const revertData = error.data
		console.log(`Transaction failed: ${revertData}`)
		const decodedError = liquidity.interface.parseError(revertData)
		console.log('decodedError: ', decodedError)
		if (decodedError) {
			console.log(`Transaction failed: ${decodedError.name}`)
			console.log(`content: ${JSON.stringify(decodedError)}`)
		}
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
