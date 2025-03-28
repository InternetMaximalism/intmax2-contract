import { Rollup } from '../../typechain-types';
import type { ContractTransactionResponse } from 'ethers';
import type { FullBlock } from './types/fullBlock';
import type { PairingData } from './types/pairing_data';
export declare function loadFullBlocks(): FullBlock[];
export declare function loadPairingData(): PairingData;
export declare function postBlock(fullBlock: FullBlock, rollup: Rollup): Promise<ContractTransactionResponse>;
