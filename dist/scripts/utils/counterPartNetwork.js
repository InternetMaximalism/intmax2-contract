"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCounterPartNetwork = getCounterPartNetwork;
const hardhat_1 = require("hardhat");
function getCounterPartNetwork() {
    if (hardhat_1.network.name === 'localhost') {
        return 'localhost';
    }
    if (hardhat_1.network.name === 'sepolia') {
        return 'scrollSepolia';
    }
    if (hardhat_1.network.name === 'scrollSepolia') {
        return 'sepolia';
    }
    if (hardhat_1.network.name === 'mainnet') {
        return 'scroll';
    }
    if (hardhat_1.network.name === 'scroll') {
        return 'mainnet';
    }
    throw new Error('unknown network');
}
