export function splitBigIntTo64BitChunks(value: bigint): bigint[] {
	const chunkSize = 64n
	const mask = (1n << chunkSize) - 1n
	const chunks: bigint[] = []

	while (value > 0n) {
		const chunk = value & mask
		chunks.unshift(chunk)
		value >>= chunkSize
	}
	return chunks
}

export function splitBigIntTo32BitChunks(value: bigint): bigint[] {
	const chunkSize = 32n
	const mask = (1n << chunkSize) - 1n
	const chunks: bigint[] = []
	while (value > 0n) {
		const chunk = value & mask
		chunks.unshift(chunk)
		value >>= chunkSize
	}
	return chunks
}

export function combine64BitChunksToBigInt(chunks: bigint[]): bigint {
	const chunkSize = 64n
	let result = 0n

	for (const chunk of chunks) {
		result = (result << chunkSize) | chunk
	}

	return result
}

export function splitSaltTo64BitChunks(salt: string): bigint[] {
	// Add hex prefix if not present
	const hexSalt = salt.startsWith('0x') ? salt : '0x' + salt
	return splitBigIntTo64BitChunks(BigInt(hexSalt))
}
