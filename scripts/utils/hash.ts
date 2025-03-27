import { hashNoPad } from 'poseidon-goldilocks'
import {
	combine64BitChunksToBigInt,
	splitBigIntTo32BitChunks,
	splitSaltTo64BitChunks,
} from './conversion'

export function getPubkeySaltHash(intMaxAddress: bigint, salt: string): string {
	const pubkeyChunks = splitBigIntTo32BitChunks(intMaxAddress)
	const saltChunks = splitSaltTo64BitChunks(salt)
	const inputs = [...pubkeyChunks, ...saltChunks]
	const hashChunks = hashNoPad(inputs)
	const hash = combine64BitChunksToBigInt(hashChunks)
	return '0x' + hash.toString(16).padStart(64, '0')
}
