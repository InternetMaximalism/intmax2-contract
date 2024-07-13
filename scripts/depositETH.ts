import { ethers } from 'hardhat'
import 'dotenv/config'
import contractAddresses from './contractAddresses.json'
import { Liquidity } from '../typechain-types'
import { getPubkeySaltHash } from './utils/hash'

const getLatestDepositEvents = async (liquidity: Liquidity, sender: string) => {
	// fetch the latest deposit event for the owner
	const depositEvents = await liquidity.queryFilter(
		liquidity.filters.Deposited(undefined, sender),
	)
	const depositEvent = depositEvents.pop()
	if (!depositEvent) {
		throw new Error('depositEvent is not set')
	}

	return depositEvent.args
}

async function main() {
	const liquidityContractAddress = contractAddresses.liquidity
	if (!liquidityContractAddress) {
		throw new Error('liquidityContractAddress is not set')
	}

	const owner = (await ethers.getSigners())[0].address
	console.log('owner address', owner)

	const liquidity = await ethers.getContractAt(
		'Liquidity',
		liquidityContractAddress,
	)

	const recipientIntMaxAddress = BigInt(1)
	const salt = '0x' + '0'.repeat(64)
	const recipientSaltHash = getPubkeySaltHash(recipientIntMaxAddress, salt)
	const amount = ethers.parseEther('0.0000000001') // 0.1 Gwei
	const tx = await liquidity.depositETH(recipientSaltHash, {
		value: amount,
	})
	console.log('tx hash:', tx.hash)
	const receipt = await tx.wait()
	console.log('Deposited ETH')

	// // get the deposit index
	// const depositEvent = receipt.events?.[0];
	// console.log("deposit events:", depositEvent);
	// const depositEventResult = depositEvent?.args;
	// if (!depositEventResult) {
	//   throw new Error("deposit is not set");
	// }

	const depositEventResult = await getLatestDepositEvents(liquidity, owner)
	const depositId = depositEventResult.depositId
	if (depositId == null) {
		throw new Error('depositId is not set')
	}

	const depositData = {
		recipientSaltHash: depositEventResult.recipientSaltHash,
		tokenIndex: depositEventResult.tokenIndex,
		amount: depositEventResult.amount,
	}
	console.log('deposit data:', depositData)

	console.log('deposit ID', depositId)
	console.log('pending deposit:', await liquidity.pendingDepositData(depositId))

	// cancel the deposit
	const tx2 = await liquidity.cancelPendingDeposit(depositId, depositData)
	console.log('tx hash:', tx2.hash)
	await tx2.wait()
	console.log('Cancelled deposit')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
