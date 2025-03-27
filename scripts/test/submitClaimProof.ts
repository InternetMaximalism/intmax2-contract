import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getRandomSalt } from '../utils/rand'
import { makeClaimInfo } from '../utils/claim'

async function main() {
	// note that to submit a claim proof, you need to post at least one block
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.rollup || !deployedContracts.claim) {
		throw new Error('rollup and claim contracts should be deployed')
	}
	const rollup = await ethers.getContractAt('Rollup', deployedContracts.rollup)
	const claim = await ethers.getContractAt('Claim', deployedContracts.claim)

	const blockNumber = 1 // block number of public input of claim
	const blockHash = await rollup.blockHashes(blockNumber)

	const recipient = (await ethers.getSigners())[0].address
	const singleClaim = {
		recipient,
		amount: ethers.parseEther('0.1').toString(),
		nullifier: getRandomSalt(),
		blockHash,
		blockNumber,
	}

	const claimInfo = makeClaimInfo(recipient, [singleClaim])
	const tx = await claim.submitClaimProof(
		claimInfo.claims,
		claimInfo.claimProofPublicInputs,
		'0x', // dummy proof
	)
	console.log('submit claim proof tx hash:', tx.hash)
	await tx.wait()
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
