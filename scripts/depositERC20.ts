import { ethers } from 'hardhat'
import 'dotenv/config'
import contractAddresses from './contractAddresses.json'
import { ILiquidity, Liquidity } from '../typechain-types'
import { getPubkeySaltHash } from './utils/hash'

const getLatestDepositEvent = async (
	liquidity: ILiquidity | Liquidity,
	sender: string,
) => {
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

	const testErc20ContractAddress = contractAddresses.testErc20
	if (!testErc20ContractAddress) {
		throw new Error('testErc20ContractAddress is not set')
	}

	const owner = (await ethers.getSigners())[0].address
	console.log('owner address', owner)

	const liquidity = await ethers.getContractAt(
		'Liquidity',
		liquidityContractAddress,
	)

	const testErc20 = await ethers.getContractAt(
		'TestERC20',
		testErc20ContractAddress,
	)

	const tokenAddress = contractAddresses.testErc20
	const recipientIntMaxAddress = BigInt(1)
	const salt = '0x' + '0'.repeat(64)
	const recipientSaltHash = getPubkeySaltHash(recipientIntMaxAddress, salt)
	const amount = '1000000'

	const approvalTx = await testErc20.approve(liquidityContractAddress, amount)
	console.log('tx hash:', approvalTx.hash)
	await approvalTx.wait()
	console.log('Approved ERC20')

	console.log('balance of owner:', await testErc20.balanceOf(owner))

	const tx = await liquidity.depositERC20(
		tokenAddress,
		recipientSaltHash,
		amount,
	)
	console.log('tx hash:', tx.hash)
	const receipt = await tx.wait()
	console.log('Deposited ERC20')

	console.log('balance of owner:', await testErc20.balanceOf(owner))

	// // get the deposit index
	// const depositEvent = receipt.events?.[0];
	// console.log("deposit event:", depositEvent);
	// const depositEventResult = depositEvent?.args;
	// if (!depositEventResult) {
	//   throw new Error("deposit is not set");
	// }

	const depositEventResult = await getLatestDepositEvent(liquidity, owner)
	console.log('depositEventResult', depositEventResult)

	const depositId = depositEventResult.depositId
	console.log('deposit ID', depositId)
	if (depositId == null) {
		throw new Error('depositId is not set')
	}

	const depositData = {
		recipientSaltHash: depositEventResult.recipientSaltHash,
		tokenIndex: depositEventResult.tokenIndex,
		amount: depositEventResult.amount,
	}
	console.log('deposit data:', depositData)

	console.log('pending deposit', await liquidity.pendingDepositData(depositId))

	// cancel the deposit
	const tx2 = await liquidity.cancelPendingDeposit(depositId, depositData)
	console.log('tx hash:', tx2.hash)
	await tx2.wait()
	console.log('Cancelled deposit')

	console.log('balance of owner:', await testErc20.balanceOf(owner))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
