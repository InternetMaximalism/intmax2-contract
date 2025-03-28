"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const counterPartNetwork_1 = require("./counterPartNetwork");
const io_1 = require("./io");
async function main() {
    const deployedL1Contracts = await (0, io_1.readDeployedContracts)();
    if (!deployedL1Contracts.testErc20 || !deployedL1Contracts.liquidity) {
        throw new Error('all l1 contracts should be deployed');
    }
    const deployedL2Contracts = await (0, io_1.readDeployedContracts)((0, counterPartNetwork_1.getCounterPartNetwork)());
    if (!deployedL2Contracts.rollup ||
        !deployedL2Contracts.withdrawal ||
        !deployedL2Contracts.claim ||
        !deployedL2Contracts.blockBuilderRegistry ||
        !deployedL2Contracts.withdrawalPlonkVerifier ||
        !deployedL2Contracts.claimPlonkVerifier) {
        throw new Error('all l2 contracts should be deployed');
    }
    console.log('----------L1 contracts----------');
    const l1Contracts = ['testErc20', 'liquidity'];
    // l1 contracts
    for (const contract of l1Contracts) {
        const address = deployedL1Contracts[contract];
        if (!address) {
            throw new Error(`${contract} should be deployed`);
        }
        const url = `https://sepolia.etherscan.io/address/${address}`;
        console.log(`${contract}: ${url}`);
    }
    console.log('\n----------L2 contracts----------');
    const l2Contracts = [
        'rollup',
        'withdrawal',
        'claim',
        'blockBuilderRegistry',
        'withdrawalPlonkVerifier',
        'claimPlonkVerifier',
    ];
    // l2 contracts
    for (const contract of l2Contracts) {
        const address = deployedL2Contracts[contract];
        if (!address) {
            throw new Error(`${contract} should be deployed`);
        }
        const url = `https://sepolia.scrollscan.com/address/${address}`;
        console.log(`${contract}: ${url}`);
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
