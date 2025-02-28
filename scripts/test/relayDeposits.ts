import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

async function main() {
	// note you have to analyze the deposits before relaying them
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

	const analyzer = (await ethers.getSigners())[1]
	console.log('analyzer address:', analyzer.address)

	// The estimated gas limit is about 220k + 20k * numDeposits. For details, see scripts/test/rollup.ts
	const buffer = 100_000n
	const gasLimit = 220_000n + 20_000n * numDepositsToRelay + buffer
	try {
		const tx = await liquidity
			.connect(analyzer)
			.analyzeAndRelayDeposits(lastDepositId, [], gasLimit, {
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
