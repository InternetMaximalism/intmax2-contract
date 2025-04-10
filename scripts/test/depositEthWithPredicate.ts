import { ethers, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getRandomPubkey, getRandomSalt } from '../utils/rand'
import { getLastDepositedEvent } from '../utils/events'
import {
	encodePredicateSignatures,
	fetchPredicateSignatures,
} from '../utils/predicate'
import 'dotenv/config'
import { getPubkeySaltHash } from '../utils/hash'

async function main() {
	if (network.name !== 'mainnet' && network.name !== 'holesky') {
		throw new Error(
			'Please use scripts/test/depositEth.ts instead on networks other than mainnet and holesky.',
		)
	}

	const deployedContracts = await readDeployedContracts()
	const amlPermitter = await ethers.getContractAt(
		'PredicatePermitter',
		deployedContracts.amlPermitter,
	)
	if (!deployedContracts.amlPermitter) {
		throw new Error('AML permitter contract should not be deployed')
	}

	const user = (await ethers.getSigners())[0]
	const balance = await ethers.provider.getBalance(user.address)
	console.log('balance:', balance.toString())
	const pubkey = getRandomPubkey() // intmax address of user
	const salt = getRandomSalt() // random salt
	const recipientSaltHash = getPubkeySaltHash(pubkey, salt)
	const deposit = {
		recipientSaltHash,
		tokenIndex: 0,
		amount: ethers.parseEther('0.000000001'),
	}

	console.log('amlPermitter address:', await amlPermitter.getAddress())
	const policyId = await amlPermitter.getPolicy()
	console.log('policyId:', policyId)
	const serviceManager = await amlPermitter.getPredicateManager()
	console.log('serviceManager:', serviceManager)

	const iface = new ethers.Interface(['function depositNativeToken(bytes32)'])
	const encodedArgs = iface.encodeFunctionData('depositNativeToken', [
		recipientSaltHash,
	])
	console.log('encodedArgs', encodedArgs)

	// Retrieve the signature from the Predicate
	const predicateBaseUrl = process.env.PREDICATE_API_URL;
	if (!predicateBaseUrl) {
		throw new Error('PREDICATE_API_URL is not defined in .env file')
	}

	const predicateSignatures = await fetchPredicateSignatures(
		predicateBaseUrl,
		deployedContracts.amlPermitter,
		user.address,
		deposit.amount, // only native token
		encodedArgs,
	)
	console.log('predicateSignatures', predicateSignatures)
	const encodedPredicateMessage = encodePredicateSignatures(predicateSignatures)

	// if (!deployedContracts.liquidity) {
	// 	throw new Error('liquidity contract should not be deployed')
	// }
	// const liquidity = await ethers.getContractAt(
	// 	'Liquidity',
	// 	deployedContracts.liquidity,
	// )
	// const tx = await liquidity
	// 	.connect(user)
	// 	.depositNativeToken(
	// 		deposit.recipientSaltHash,
	// 		encodedPredicateMessage,
	// 		'0x',
	// 		{
	// 			value: deposit.amount,
	// 		},
	// 	)
	// console.log('deposit tx hash:', tx.hash)
	// const res = await tx.wait()
	// if (!res?.blockNumber) {
	// 	throw new Error('No block number found')
	// }
	// const depositedBlockNumber = res.blockNumber
	// const depositEvent = await getLastDepositedEvent(
	// 	liquidity,
	// 	user.address,
	// 	depositedBlockNumber,
	// )
	// const { depositId } = depositEvent.args
	// console.log('depositId:', depositId)

	// const depositData = await liquidity.getDepositData(depositId)
	// console.log('deposit data:', depositData)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
