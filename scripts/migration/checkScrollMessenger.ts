import { ethers } from 'ethers'
import hre from 'hardhat'

// Configuration
const SCROLL_MESSENGER_ADDRESS = '0x781e90f1c8Fc4611c9b7497C3B47F99Ef6969CbC'
const WITHDRAWAL_CONTRACT_ADDRESS = '0xe72A023C6969afeAbC184822276c1Be1D048Bc21'
const LIQUIDITY_CONTRACT_ADDRESS = '0xF65e73aAc9182e353600a916a6c7681F810f79C3'
const INTMAX_AGGREGATOR_ADDRESS = '0x9D17A62BA7A1F6fB13C4A2011AC169d81E02fb54'
const START_BLOCK = 16627804
const BATCH_SIZE = 500 // Process events in batches

// SentMessage event signature
const SENT_MESSAGE_EVENT_SIGNATURE =
	'SentMessage(address,address,uint256,uint256,uint256,bytes)'

interface ValidationResult {
	totalEvents: number
	validWithdrawals: number
	invalidWithdrawals: number
	invalidDetails: Array<{
		txHash: string
		blockNumber: number
		actualMsgSender: string
		timestamp: number
	}>
}

async function main() {
	const fromAddress = process.env.FROM_ADDRESS || WITHDRAWAL_CONTRACT_ADDRESS

	console.log('Starting Scroll Messenger SentMessage event verification...')
	console.log('Configuration:')
	console.log(`- Scroll Messenger: ${SCROLL_MESSENGER_ADDRESS}`)
	console.log(`- Withdrawal Contract: ${fromAddress}`)
	console.log(`- Liquidity Contract: ${LIQUIDITY_CONTRACT_ADDRESS}`)
	console.log(`- Expected Aggregator: ${INTMAX_AGGREGATOR_ADDRESS}`)
	console.log(`- Start Block: ${START_BLOCK}`)

	const provider = hre.ethers.provider
	const currentBlock = await provider.getBlockNumber()
	console.log(`- Current Block: ${currentBlock}`)

	// Create interface for decoding events
	const iface = new ethers.Interface([
		'event SentMessage(address indexed sender, address indexed target, uint256 value, uint256 messageNonce, uint256 gasLimit, bytes message)',
	])

	const result: ValidationResult = {
		totalEvents: 0,
		validWithdrawals: 0,
		invalidWithdrawals: 0,
		invalidDetails: [],
	}

	// Process events in batches
	for (
		let fromBlock = START_BLOCK;
		fromBlock <= currentBlock;
		fromBlock += BATCH_SIZE
	) {
		const toBlock = Math.min(fromBlock + BATCH_SIZE - 1, currentBlock)
		console.log(`\nProcessing blocks ${fromBlock} to ${toBlock}...`)

		try {
			// Get logs for SentMessage events
			const logs = await provider.getLogs({
				address: SCROLL_MESSENGER_ADDRESS,
				topics: [
					ethers.id(SENT_MESSAGE_EVENT_SIGNATURE),
					ethers.zeroPadValue(ethers.getAddress(fromAddress), 32), // sender
					ethers.zeroPadValue(
						ethers.getAddress(LIQUIDITY_CONTRACT_ADDRESS),
						32,
					), // target
				],
				fromBlock,
				toBlock,
			})

			console.log(`Found ${logs.length} SentMessage events in this batch`)

			for (const log of logs) {
				result.totalEvents++

				// Decode the event
				const parsedLog = iface.parseLog({
					topics: log.topics as string[],
					data: log.data,
				})

				if (!parsedLog) {
					console.error(`Failed to parse log in tx ${log.transactionHash}`)
					continue
				}

				// Get transaction details to extract msg.sender
				const tx = await provider.getTransaction(log.transactionHash)
				if (!tx) {
					console.error(`Failed to get transaction ${log.transactionHash}`)
					continue
				}

				const msgSender = tx.from.toLowerCase()
				const expectedAggregator = INTMAX_AGGREGATOR_ADDRESS.toLowerCase()

				if (msgSender === expectedAggregator) {
					result.validWithdrawals++
				} else {
					result.invalidWithdrawals++

					// Get block timestamp
					const block = await provider.getBlock(log.blockNumber)
					const timestamp = block ? block.timestamp : 0

					result.invalidDetails.push({
						txHash: log.transactionHash,
						blockNumber: log.blockNumber,
						actualMsgSender: msgSender,
						timestamp,
					})

					console.warn(`❌ Invalid withdrawal detected:`)
					console.warn(`   TX: ${log.transactionHash}`)
					console.warn(`   Block: ${log.blockNumber}`)
					console.warn(`   Actual msg.sender: ${msgSender}`)
					console.warn(`   Expected: ${expectedAggregator}`)
				}

				// Show progress every 10 events
				if (result.totalEvents % 10 === 0) {
					console.log(`Progress: ${result.totalEvents} events processed`)
				}
			}
		} catch (error) {
			console.error(`Error processing blocks ${fromBlock}-${toBlock}:`, error)
		}
	}

	// Print final results
	console.log('\n================== VERIFICATION RESULTS ==================')
	console.log(`Total SentMessage events: ${result.totalEvents}`)
	console.log(`Valid withdrawals: ${result.validWithdrawals}`)
	console.log(`Invalid withdrawals: ${result.invalidWithdrawals}`)

	if (result.invalidWithdrawals > 0) {
		console.log(
			'\n================== INVALID WITHDRAWAL DETAILS ==================',
		)
		for (const invalid of result.invalidDetails) {
			const date = new Date(invalid.timestamp * 1000).toISOString()
			console.log(`\nTransaction: ${invalid.txHash}`)
			console.log(`Block: ${invalid.blockNumber}`)
			console.log(`Timestamp: ${date}`)
			console.log(`Actual msg.sender: ${invalid.actualMsgSender}`)
			console.log(`Expected: ${INTMAX_AGGREGATOR_ADDRESS.toLowerCase()}`)
		}
	} else {
		console.log('\n✅ All withdrawals are valid!')
	}

	// Save results to file
	const resultsFile = `verification-results-${Date.now()}.json`
	await import('fs').then((fs) => {
		fs.writeFileSync(resultsFile, JSON.stringify(result, null, 2))
		console.log(`\nResults saved to: ${resultsFile}`)
	})
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
