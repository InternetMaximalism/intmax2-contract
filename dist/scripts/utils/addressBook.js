"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getL2MessengerAddress = exports.getL1MessengerAddress = void 0;
const hardhat_1 = require("hardhat");
const io_1 = require("./io");
const getL1MessengerAddress = async () => {
    if (hardhat_1.network.name === 'sepolia') {
        return '0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A';
    }
    if (hardhat_1.network.name === 'mainnet') {
        return '0x6774Bcbd5ceCeF1336b5300fb5186a12DDD8b367';
    }
    // Get mock l1 messenger address from deployed contracts
    const deployedContracts = await (0, io_1.readDeployedContracts)();
    if (deployedContracts.mockL1ScrollMessenger) {
        return deployedContracts.mockL1ScrollMessenger;
    }
    throw new Error('Unsupported network');
};
exports.getL1MessengerAddress = getL1MessengerAddress;
const getL2MessengerAddress = async () => {
    if (hardhat_1.network.name === 'scrollSepolia') {
        return '0xBa50f5340FB9F3Bd074bD638c9BE13eCB36E603d';
    }
    if (hardhat_1.network.name === 'scroll') {
        return '0x781e90f1c8Fc4611c9b7497C3B47F99Ef6969CbC';
    }
    // Get mock l2 messenger address from deployed contracts
    const deployedContracts = await (0, io_1.readDeployedContracts)();
    if (deployedContracts.mockL2ScrollMessenger) {
        return deployedContracts.mockL2ScrollMessenger;
    }
    throw new Error('Unsupported network');
};
exports.getL2MessengerAddress = getL2MessengerAddress;
