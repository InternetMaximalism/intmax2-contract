import { ethers, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getRandomPubkey, getRandomSalt } from '../../utils/rand'
import { getPubkeySaltHash } from '../../utils/hash'
import { sleep } from '../../utils/sleep'
import type { ContractTransactionResponse } from 'ethers'
import { getLastDepositedEvent } from '../../utils/events'

if (network.name !== 'sepolia') {
	throw new Error('This script should be run on sepolia network')
}

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.liquidity) {
		throw new Error('No liquidity contract found')
	}
	const liquidity = await ethers.getContractAt(
		'Liquidity',
		deployedContracts.liquidity,
	)

	let tx: ContractTransactionResponse

	// deposit
	const user = (await ethers.getSigners())[0]
	const pubkey = getRandomPubkey() // intmax address of user
	const salt = getRandomSalt() // random salt
	const pubkeySaltHash = getPubkeySaltHash(pubkey, salt)
	tx = await liquidity.connect(user).depositNativeToken(pubkeySaltHash, {
		value: ethers.parseEther('0.0001'),
	})
	console.log('deposit tx hash:', tx.hash)
	const res = await tx.wait()
	if (!res?.blockNumber) {
		throw new Error('No block number found')
	}
	const depositedBlockNumber = res.blockNumber

	// get deposit id
	const depositEvent = await getLastDepositedEvent(
		liquidity,
		user.address,
		depositedBlockNumber,
	)
	const { depositId } = depositEvent.args
	console.log('depositId:', depositId)
	await sleep(30)

	// analyze till depositId
	const analyzer = (await ethers.getSigners())[1]
	tx = await liquidity.connect(analyzer).analyzeAndRelayDeposits(depositId, [], 800_000,{
		value: ethers.parseEther('0.1'), // will be refunded automatically
	} )
	console.log('analyzeAndRelayDeposits tx hash:', tx.hash)
	await tx.wait()
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
