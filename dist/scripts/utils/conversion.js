"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitBigIntTo64BitChunks = splitBigIntTo64BitChunks;
exports.splitBigIntTo32BitChunks = splitBigIntTo32BitChunks;
exports.combine64BitChunksToBigInt = combine64BitChunksToBigInt;
exports.splitSaltTo64BitChunks = splitSaltTo64BitChunks;
function splitBigIntTo64BitChunks(value) {
    const chunkSize = 64n;
    const mask = (1n << chunkSize) - 1n;
    const chunks = [];
    while (value > 0n) {
        const chunk = value & mask;
        chunks.unshift(chunk);
        value >>= chunkSize;
    }
    return chunks;
}
function splitBigIntTo32BitChunks(value) {
    const chunkSize = 32n;
    const mask = (1n << chunkSize) - 1n;
    const chunks = [];
    while (value > 0n) {
        const chunk = value & mask;
        chunks.unshift(chunk);
        value >>= chunkSize;
    }
    return chunks;
}
function combine64BitChunksToBigInt(chunks) {
    const chunkSize = 64n;
    let result = 0n;
    for (const chunk of chunks) {
        result = (result << chunkSize) | chunk;
    }
    return result;
}
function splitSaltTo64BitChunks(salt) {
    // Add hex prefix if not present
    const hexSalt = salt.startsWith('0x') ? salt : '0x' + salt;
    return splitBigIntTo64BitChunks(BigInt(hexSalt));
}
