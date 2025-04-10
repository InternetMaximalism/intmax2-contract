import {
	PredicateResponse,
	signaturesToBytes,
} from 'predicate-sdk'
import { ethers } from 'hardhat'
import { z } from 'zod'
import axios from 'axios'

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

export const fetchPredicateSignatures = async (
	predicateBaseUrl: string,
	permitterContractAddress: string,
	depositor: string,
	msgValue: bigint,
	encodedArgs: string,
) => {
	const request = {
		from: depositor,
		to: permitterContractAddress,
		data: encodedArgs,
		msg_value: msgValue.toString(),
	}
	console.log('request', JSON.stringify(request, null, 2))
	console.log("predicateBaseUrl", predicateBaseUrl);
	const predicateSignatures = await axios.post(
		`${predicateBaseUrl}/v1/predicate/evaluate-policy`,
		request,
	)

	// const predicateClient = new Predicate()
	// const predicateSignatures = await predicateClient.evaluatePolicy(request)

	return predicateSignatures.data
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
