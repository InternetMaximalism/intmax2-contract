import { ethers } from 'hardhat'

export const goldilocksModulus = (1n << 64n) - (1n << 32n) + 1n

export function getRandomBigInt(byteLength: number): bigint {
	const randomBytes = new Uint8Array(byteLength)
	crypto.getRandomValues(randomBytes)
	let randomBigInt = BigInt(0)
	for (let i = 0; i < byteLength; i++) {
		randomBigInt = (randomBigInt << BigInt(8)) | BigInt(randomBytes[i])
	}
	return randomBigInt
}

export function getRandomPubkey(): bigint {
	return getRandomBigInt(32)
}

export function getRandomSalt(): string {
	const salt = Array.from(
		{ length: 4 },
		() => getRandomBigInt(8) % goldilocksModulus,
	)
	const packed = ethers.solidityPacked(
		['uint64', 'uint64', 'uint64', 'uint64'],
		salt,
	)
	return packed.padStart(64, '0')
}
