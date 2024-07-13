import { ethers, network } from 'hardhat'
import 'dotenv/config'
import contractAddresses from './contractAddresses.json'
import { getFee } from './utils/scrollMessenger'
import { getPubkeySaltHash } from './utils/hash'

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

	console.log('balance', (await ethers.provider.getBalance(owner)).toString())

	const lastAnalyzedDepositId = await liquidity.lastAnalyzedDepositId()
	const gasLimit = await liquidity.submitDeposits.estimateGas(
		lastAnalyzedDepositId,
		{
			value: await ethers.provider.getBalance(owner),
		},
	)
	console.log('gasLimit', gasLimit)
	const fee = await getFee(gasLimit)
	// const fee = ethers.utils.parseEther('0.00001');
	console.log('fee:', ethers.formatEther(fee), 'ETH')
	const tx = await liquidity.submitDeposits(lastAnalyzedDepositId, {
		value: fee,
	})
	console.log('tx hash:', tx.hash)
	await tx.wait()
	console.log('Submit deposits')

	console.log('balance', (await ethers.provider.getBalance(owner)).toString())

	if (network.name !== 'scroll' && network.name !== 'scrollsepolia') {
		const rollupContractAddress = contractAddresses.rollup
		const rollup = await ethers.getContractAt('Rollup', rollupContractAddress)

		const lastProcessedDepositId = 2
		const recipientIntMaxAddress = BigInt(1)
		const salt = '0x' + '0'.repeat(63) + '1'
		const recipientSaltHash = getPubkeySaltHash(recipientIntMaxAddress, salt)
		const deposits = [
			{
				recipientSaltHash: recipientSaltHash,
				tokenIndex: 1,
				amount: 100,
			},
		] // TODO: Get withdrawals from the Rollup contract
		const depositHashes = deposits.map((deposit) => {
			return ethers.solidityPackedKeccak256(
				['bytes32', 'uint256', 'uint256'],
				[deposit.recipientSaltHash, deposit.tokenIndex, deposit.amount],
			)
		})
		const tx2 = await rollup.processDeposits(
			lastProcessedDepositId,
			depositHashes,
		)
		console.log('tx hash:', tx2.hash)
		await tx2.wait()
		console.log('Process deposits')

		console.log('deposit tree root', (await rollup.getDepositRoot()).toString())
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
