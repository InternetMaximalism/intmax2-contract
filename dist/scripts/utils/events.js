"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastDepositedEvent = getLastDepositedEvent;
async function getLastDepositedEvent(liquidity, sender, fromBlock) {
    const events = await liquidity.queryFilter(liquidity.filters.Deposited(undefined, sender), fromBlock);
    const latestEvent = events[events.length - 1];
    return latestEvent;
}
