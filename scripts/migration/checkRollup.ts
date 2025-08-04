import { ethers } from 'hardhat'
import { Rollup } from '../../typechain-types/contracts/Rollup'
import { readDeployedContracts } from '../utils/io'

async function main() {
	const deployed = await readDeployedContracts()
	if (!deployed.rollup) throw new Error('Rollup contract is not deployed on L2')

	const rollup = (await ethers.getContractAt(
		'Rollup',
		deployed.rollup,
	)) as unknown as Rollup

	const blockNumber = await rollup.getLatestBlockNumber()
	console.log(`Latest block number on Rollup: ${blockNumber}`)

	const blockHash = await rollup.getBlockHash(blockNumber)
	console.log(`Block hash for block number ${blockNumber}: ${blockHash}`)

	const depositIndex = await rollup.depositIndex()
	console.log(`Deposit index for block number ${blockNumber}: ${depositIndex}`)

	const depositTreeRoot = await rollup.depositTreeRoot()
	console.log(
		`Deposit tree root for block number ${blockNumber}: ${depositTreeRoot}`,
	)
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
