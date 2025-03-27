import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getRandomSalt } from '../utils/rand'
import { makeWithdrawalInfo } from '../utils/withdrawal'

async function main() {
	// note that to submit a withdrawal proof, you need to post at least one block
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.rollup || !deployedContracts.withdrawal) {
		throw new Error('rollup and withdrawal contracts should be deployed')
	}
	const rollup = await ethers.getContractAt('Rollup', deployedContracts.rollup)
	const withdrawal = await ethers.getContractAt(
		'Withdrawal',
		deployedContracts.withdrawal,
	)

	const blockNumber = 1 // block number of public input of withdrawal
	const blockHash = await rollup.blockHashes(blockNumber)

	const recipient = (await ethers.getSigners())[0].address
	const singleWithdrawal = {
		recipient,
		tokenIndex: 0,
		amount: ethers.parseEther('0.1').toString(),
		nullifier: getRandomSalt(),
		blockHash,
		blockNumber,
	}

	const withdrawalInfo = makeWithdrawalInfo(recipient, [singleWithdrawal])
	const tx = await withdrawal.submitWithdrawalProof(
		withdrawalInfo.withdrawals,
		withdrawalInfo.withdrawalProofPublicInputs,
		'0x', // dummy proof
	)
	console.log('submit withdrawal proof tx hash:', tx.hash)
	await tx.wait()
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
