import { ethers, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getL1MessengerAddress } from '../utils/addressBook'
import { IL1ScrollMessenger__factory } from '../../typechain-types'

const scrollMessengerAbi = IL1ScrollMessenger__factory.abi

if (network.name !== 'sepolia') {
	throw new Error('This script should be run on sepolia network')
}

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (
		!deployedContracts.rollup ||
		!deployedContracts.withdrawal ||
		!deployedContracts.blockBuilderRegistry ||
		!deployedContracts.withdrawalPlonkVerifier ||
		!deployedContracts.liquidity
	) {
		throw new Error('all contracts should be deployed')
	}
	const l1ScrollMessenger = new ethers.Contract(
		await getL1MessengerAddress(),
		scrollMessengerAbi,
		(await ethers.getSigners())[0],
	)

	// Following code is commented out because we use mock messaging data.

	// const data = await fetchUnclaimedWithdrawals(deployedContracts.withdrawal)
	// const results = data.data.results
	// console.log('unclaimed withdrawals:', results)
	// if (results.length === 0) {
	// 	throw new Error('no unclaimed withdrawals')
	// }
	// const latestResult = results[results.length - 1]
	// const claimInfo = latestResult.claim_info
	// if (!claimInfo) {
	// 	throw new Error('no claim info')
	// }
	// if (!claimInfo.claimable) {
	// 	throw new Error('claimable is false')
	// }

	const claimInfo = {
		from: deployedContracts.withdrawal,
		to: deployedContracts.liquidity,
		value: '0',
		nonce: '5678405',
		message: '0x',
		proof: {
			batch_index: 0,
			merkle_proof:
				'0x088f0bdd00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
		},
	}
	const proof = {
		batchIndex: claimInfo.proof.batch_index,
		merkleProof: claimInfo.proof.merkle_proof,
	}
	const tx = await l1ScrollMessenger.relayMessageWithProof(
		claimInfo.from,
		claimInfo.to,
		claimInfo.value,
		claimInfo.nonce,
		claimInfo.message,
		proof,
	)
	console.log('l1 messenger tx:', tx.hash)
	await tx.wait()
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
