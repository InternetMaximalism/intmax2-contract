import {
	PredicateClient,
	PredicateConfig,
	PredicateResponse,
	signaturesToBytes,
} from 'predicate-sdk'
import { ethers } from 'hardhat'
import { z } from 'zod'
import { cleanEnv, str } from 'envalid'

export const predicateSignaturesValidation = z.strictObject({
	is_compliant: z.boolean(),
	signers: z.array(z.string()),
	signature: z.array(z.string()),
	expiry_block: z.number(),
	task_id: z.string(),
})

export type predicateSignaturesValidationType = z.infer<
	typeof predicateSignaturesValidation
>

const env = cleanEnv(process.env, {
	PREDICATE_API_URL: str(),
	PREDICATE_API_KEY: str(),
})

export class Predicate {
	private predicateClient: PredicateClient

	constructor() {
		const predicateConfig: PredicateConfig = {
			apiUrl: env.PREDICATE_API_URL,
			apiKey: env.PREDICATE_API_KEY,
		}
		this.predicateClient = new PredicateClient(predicateConfig)
	}

	public async evaluatePolicy(request: {
		from: string
		to: string
		data: string
		msg_value: string
	}): Promise<PredicateResponse> {
		try {
			const headers = {
				'Content-Type': 'application/json',
				'x-api-key': env.PREDICATE_API_KEY,
			}
			const options = {
				method: 'POST',
				headers,
				body: JSON.stringify(request),
			}

			console.log('PREDICATE_API_URL', env.PREDICATE_API_URL)
			const response = await fetch(`${env.PREDICATE_API_URL}/v1/task`, options)
			if (!response.ok) {
				throw new Error(
					`Failed to fetch predicate signatures: ${response.statusText}`,
				)
			}

			const json = await response.json()
			const predicateSignatures = predicateSignaturesValidation.parse(json)

			return predicateSignatures
		} catch (error) {
			console.error('Error fetching predicate signatures:', error)
			throw error
		}
	}
}

export const fetchPredicateSignatures = async (
	permitterContractAddress: string,
	depositor: string,
	msgValue: bigint,
	encodedArgs: string,
) => {
	const predicateClient = new Predicate()
	const request = {
		from: depositor,
		to: permitterContractAddress,
		data: encodedArgs,
		msg_value: msgValue.toString(),
	}
	console.log('request', JSON.stringify(request, null, 2))
	const predicateSignatures = await predicateClient.evaluatePolicy(request)

	return predicateSignatures
}

export const encodePredicateSignatures = (
	predicateSignatures: PredicateResponse,
) => {
	const predicateMessage = signaturesToBytes(predicateSignatures)
	const predicateMessageType = [
		'tuple(string taskId, uint256 expireByBlockNumber, address[] signerAddresses, bytes[] signatures)',
	]
	const encoder = ethers.AbiCoder.defaultAbiCoder()
	return encoder.encode(predicateMessageType, [predicateMessage])
}
