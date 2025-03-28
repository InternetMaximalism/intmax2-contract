import { Liquidity } from '../../typechain-types';
import { DepositedEvent } from '../../typechain-types/contracts/liquidity/Liquidity';
export declare function getLastDepositedEvent(liquidity: Liquidity, sender: string, fromBlock: number): Promise<DepositedEvent.Log>;
