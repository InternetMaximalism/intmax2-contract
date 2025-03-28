"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goldilocksModulus = void 0;
exports.getRandomBigInt = getRandomBigInt;
exports.getRandomPubkey = getRandomPubkey;
exports.getRandomSalt = getRandomSalt;
const hardhat_1 = require("hardhat");
exports.goldilocksModulus = (1n << 64n) - (1n << 32n) + 1n;
function getRandomBigInt(byteLength) {
    const randomBytes = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBytes);
    let randomBigInt = BigInt(0);
    for (let i = 0; i < byteLength; i++) {
        randomBigInt = (randomBigInt << BigInt(8)) | BigInt(randomBytes[i]);
    }
    return randomBigInt;
}
function getRandomPubkey() {
    return getRandomBigInt(32);
}
function getRandomSalt() {
    const salt = Array.from({ length: 4 }, () => getRandomBigInt(8) % exports.goldilocksModulus);
    const packed = hardhat_1.ethers.solidityPacked(['uint64', 'uint64', 'uint64', 'uint64'], salt);
    return packed.padStart(64, '0');
}
