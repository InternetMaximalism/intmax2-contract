import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { loadFullBlocks, postBlock } from '../utils/rollup'
import { sleep } from '../utils/sleep'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.blockBuilderRegistry || !deployedContracts.rollup) {
		throw new Error('blockBuilderRegistry contract should be deployed')
	}
	const rollup = await ethers.getContractAt('Rollup', deployedContracts.rollup)

	// post block
	const fullBlocks = loadFullBlocks()
	for (let i = 1; i < 3; i++) {
		const tx = await postBlock(fullBlocks[i], rollup)
		console.log(`post block ${i} tx hash: ${tx.hash}`)
		await tx.wait()
		await sleep(30)
	}
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
