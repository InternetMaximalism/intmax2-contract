"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWithdrawalInfo = makeWithdrawalInfo;
const hardhat_1 = require("hardhat");
function makeWithdrawalInfo(aggregator, withdrawals) {
    let hash = hardhat_1.ethers.ZeroHash;
    for (const withdrawal of withdrawals) {
        hash = hashWithdrawalWithPrevHash(hash, withdrawal);
    }
    const pis = {
        lastWithdrawalHash: hash,
        withdrawalAggregator: aggregator,
    };
    const pisHash = hashWithdrawalPis(pis);
    return {
        withdrawals,
        withdrawalProofPublicInputs: pis,
        pisHash,
    };
}
function hashWithdrawalWithPrevHash(prevHash, withdrawal) {
    return hardhat_1.ethers.solidityPackedKeccak256(['bytes32', 'address', 'uint32', 'uint256', 'bytes32', 'bytes32', 'uint32'], [
        prevHash,
        withdrawal.recipient,
        withdrawal.tokenIndex,
        withdrawal.amount,
        withdrawal.nullifier,
        withdrawal.blockHash,
        withdrawal.blockNumber,
    ]);
}
function hashWithdrawalPis(pis) {
    return hardhat_1.ethers.solidityPackedKeccak256(['bytes32', 'address'], [pis.lastWithdrawalHash, pis.withdrawalAggregator]);
}
