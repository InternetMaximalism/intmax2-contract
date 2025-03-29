import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getRandomPubkey } from '../utils/rand'
import { getLastDepositedEvent } from '../utils/events'
import {
	encodePredicateSignatures,
	fetchPredicateSignatures,
} from '../utils/predicate'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.liquidity || !deployedContracts.amlPermitter) {
		throw new Error('liquidity contract should not be deployed')
	}
	const liquidity = await ethers.getContractAt(
		'Liquidity',
		deployedContracts.liquidity,
	)
	const amlPermitter = await ethers.getContractAt(
		'PredicatePermitter',
		deployedContracts.amlPermitter,
	)

	const user = (await ethers.getSigners())[0]
	const balance = await ethers.provider.getBalance(user.address)
	console.log('balance:', balance.toString())
	const pubkey = getRandomPubkey() // intmax address of user

	console.log('amlPermitter address:', amlPermitter.address)
	const policyId = await amlPermitter.getPolicy()
	console.log('policyId:', policyId)
	const serviceManager = await amlPermitter.getPredicateManager()
	console.log('serviceManager:', serviceManager)

	// Retrieve the signature from the Predicate
	const { predicateSignatures, deposit } = await fetchPredicateSignatures(
		deployedContracts.liquidity,
		user.address,
		pubkey,
		ethers.parseEther('0.000001'),
	)
	const encodedPredicateMessage = encodePredicateSignatures(predicateSignatures)

	const tx = await liquidity
		.connect(user)
		.depositNativeToken(
			deposit.recipientSaltHash,
			encodedPredicateMessage,
			'0x',
			{
				value: deposit.amount,
			},
		)
	console.log('deposit tx hash:', tx.hash)
	const res = await tx.wait()
	if (!res?.blockNumber) {
		throw new Error('No block number found')
	}
	const depositedBlockNumber = res.blockNumber
	const depositEvent = await getLastDepositedEvent(
		liquidity,
		user.address,
		depositedBlockNumber,
	)
	const { depositId } = depositEvent.args
	console.log('depositId:', depositId)

	const depositData = await liquidity.getDepositData(depositId)
	console.log('deposit data:', depositData)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
