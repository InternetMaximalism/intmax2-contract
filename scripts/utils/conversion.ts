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
	return splitBigIntTo64BitChunks(BigInt(addHexPrefix(salt)))
}

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
	return [...uint8Array]
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('')
}

export function removeHexPrefix(hexString: string): string {
	if (hexString.startsWith('0x')) {
		return hexString.slice(2)
	}
	return hexString
}

export function addHexPrefix(hexString: string): string {
	if (!hexString.startsWith('0x')) {
		return '0x' + hexString
	}
	return hexString
}
