"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPubkeySaltHash = getPubkeySaltHash;
const poseidon_goldilocks_1 = require("poseidon-goldilocks");
const conversion_1 = require("./conversion");
function getPubkeySaltHash(intMaxAddress, salt) {
    const pubkeyChunks = (0, conversion_1.splitBigIntTo32BitChunks)(intMaxAddress);
    const saltChunks = (0, conversion_1.splitSaltTo64BitChunks)(salt);
    const inputs = [...pubkeyChunks, ...saltChunks];
    const hashChunks = (0, poseidon_goldilocks_1.hashNoPad)(inputs);
    const hash = (0, conversion_1.combine64BitChunksToBigInt)(hashChunks);
    return '0x' + hash.toString(16).padStart(64, '0');
}
