import { ethers } from 'hardhat'
import { readDeployedContracts } from '../utils/io'
import { getRandomPubkey, getRandomSalt } from '../../utils/rand'
import { getPubkeySaltHash } from '../../utils/hash'
import type { ContractTransactionResponse } from 'ethers'
import { getLastDepositedEvent } from '../../utils/events'

async function main() {
	const deployedContracts = await readDeployedContracts()
	if (!deployedContracts.liquidity || !deployedContracts.testErc20) {
		throw new Error('liquidity and testErc20 contracts should be deployed')
	}
	const liquidity = await ethers.getContractAt(
		'Liquidity',
		deployedContracts.liquidity,
	)
	const testErc20 = await ethers.getContractAt(
		'TestERC20',
		deployedContracts.testErc20,
	)

	let tx: ContractTransactionResponse

	const user = (await ethers.getSigners())[0]

	const balance = await testErc20.balanceOf(user.address)
	console.log('balance:', balance.toString())

	const pubkey = getRandomPubkey() // intmax address of user
	const salt = getRandomSalt() // random salt
	const recipientSaltHash = getPubkeySaltHash(pubkey, salt)
	const amount = '1234'

	// approve
	tx = await testErc20
		.connect(user)
		.approve(await liquidity.getAddress(), amount)
	console.log('approve tx hash:', tx.hash)
	await tx.wait()

	tx = await liquidity
		.connect(user)
		.depositERC20(
			await testErc20.getAddress(),
			recipientSaltHash,
			amount,
			'0x',
			'0x',
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
	const { sender, depositId, tokenIndex, isEligible } = depositEvent.args
	console.log('depositId:', depositId)
	console.log('tokenIndex:', tokenIndex)
	console.log('isEligible:', isEligible)

	const depositData = await liquidity.getDepositData(depositId)
	console.log('deposit data:', depositData)

	const deposit = {
		depositor: sender,
		recipientSaltHash,
		tokenIndex,
		amount,
		isEligible,
	}

	// cancel the deposit
	tx = await liquidity.connect(user).cancelDeposit(depositId, deposit)
	console.log('cancel tx hash:', tx.hash)
	await tx.wait()

	console.log('after balance', await testErc20.balanceOf(user.address))
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
