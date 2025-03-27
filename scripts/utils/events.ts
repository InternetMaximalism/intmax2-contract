import { Liquidity } from '../../typechain-types'
import {
	DepositedEvent,
} from '../../typechain-types/contracts/liquidity/Liquidity'

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
