"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFullBlocks = loadFullBlocks;
exports.loadPairingData = loadPairingData;
exports.postBlock = postBlock;
const fs = __importStar(require("fs"));
const hardhat_1 = require("hardhat");
function loadFullBlocks() {
    let fullBlocks = [];
    for (let i = 1; i < 4; i++) {
        const data = fs.readFileSync(`test_data/block${i}.json`, 'utf8');
        const jsonData = JSON.parse(data);
        fullBlocks.push(jsonData);
    }
    return fullBlocks;
}
function loadPairingData() {
    const data = fs.readFileSync('test_data/pairing_test_data.json', 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData;
}
async function postBlock(fullBlock, rollup) {
    if (fullBlock.signature.blockSignPayload.isRegistrationBlock) {
        if (!fullBlock.pubkeys) {
            throw new Error('pubkeys are required');
        }
        const tx = await rollup.postRegistrationBlock(fullBlock.signature.blockSignPayload.txTreeRoot, fullBlock.signature.blockSignPayload.expiry, fullBlock.signature.blockSignPayload.blockBuilderNonce, fullBlock.signature.senderFlag, fullBlock.signature.aggPubkey, fullBlock.signature.aggSignature, fullBlock.signature.messagePoint, fullBlock.pubkeys, { value: hardhat_1.ethers.parseEther('1') });
        return tx;
    }
    else {
        if (!fullBlock.accountIds) {
            throw new Error('accountIds are required');
        }
        const tx = await rollup.postNonRegistrationBlock(fullBlock.signature.blockSignPayload.txTreeRoot, fullBlock.signature.blockSignPayload.expiry, fullBlock.signature.blockSignPayload.blockBuilderNonce, fullBlock.signature.senderFlag, fullBlock.signature.aggPubkey, fullBlock.signature.aggSignature, fullBlock.signature.messagePoint, fullBlock.signature.pubkeyHash, '0x', { value: hardhat_1.ethers.parseEther('1') });
        return tx;
    }
}
