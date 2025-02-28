import { ethers } from 'hardhat'
import type { SentMessageEvent } from '../typechain-types/@scroll-tech/contracts/libraries/IScrollMessenger'
import { IScrollMessenger__factory, Liquidity } from '../typechain-types'
import {
	DepositedEvent,
	DepositsAnalyzedAndRelayedEvent,
} from '../typechain-types/contracts/liquidity/Liquidity'

const scrollMessengerAbi = IScrollMessenger__factory.abi

export async function getLastDepositedEvent(
	liquidity: Liquidity,
	sender: string,
	fromBlock: number,
): Promise<DepositedEvent.Log> {
	const events = await liquidity.queryFilter(
		liquidity.filters.Deposited(undefined, sender),
		fromBlock,
	)
	const latestEvent = events[events.length - 1] as unknown as DepositedEvent.Log
	return latestEvent
}

export async function getLastDepositsAnalyzedAndRelayedEvent(
	liquidity: Liquidity,
	fromBlock: number,
): Promise<DepositsAnalyzedAndRelayedEvent.Log> {
	const events = await liquidity.queryFilter(
		liquidity.filters.DepositsAnalyzedAndRelayed(),
		fromBlock,
	)
	const latestEvent = events[
		events.length - 1
	] as unknown as DepositsAnalyzedAndRelayedEvent.Log
	return latestEvent
}

export async function getLastSentEvent(
	scrollMessengerAddress: string,
	fromAddress: string,
	fromBlock: number,
): Promise<SentMessageEvent.Log> {
	const scrollMessenger = new ethers.Contract(
		scrollMessengerAddress,
		scrollMessengerAbi,
		ethers.provider,
	)
	const events = await scrollMessenger.queryFilter(
		scrollMessenger.filters.SentMessage(fromAddress, null),
		fromBlock,
	)
	const latestEvent = events[
		events.length - 1
	] as unknown as SentMessageEvent.Log
	return latestEvent
}
