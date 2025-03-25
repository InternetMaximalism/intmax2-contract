import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

async function main() {
	// note that to submit a claim proof, you need to post at least one block
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.claim) {
		throw new Error('claim contracts should be deployed')
	}
	const claim = await ethers.getContractAt('Claim', deployedContracts.claim)

	const user = (await ethers.getSigners())[0]
	const period = 0
	const allocationPerPeriod = await claim.getAllocationInfo(
		period,
		user.address,
	)
	console.log('allocation per period:', allocationPerPeriod.toString())

	const tx = await claim.relayClaims(period, [user.address])
	console.log('relay claims tx hash:', tx.hash)
	await tx.wait()
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
