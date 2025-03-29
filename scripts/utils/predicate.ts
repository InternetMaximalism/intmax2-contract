import {
  PredicateClient,
  PredicateConfig,
  PredicateResponse,
  signaturesToBytes,
} from 'predicate-sdk'
import { ethers } from 'hardhat'
import { getRandomSalt } from './rand'
import { getPubkeySaltHash } from './hash'

const config = {
  PREDICATE_API_URL: process.env.PREDICATE_API_URL,
  PREDICATE_API_KEY: process.env.PREDICATE_API_KEY,
}

export class Predicate {
  private predicateClient: PredicateClient

  constructor() {
    const predicateConfig: PredicateConfig = {
      apiUrl: config.PREDICATE_API_URL!,
      apiKey: config.PREDICATE_API_KEY!,
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
        'x-api-key': process.env.PREDICATE_API_KEY!,
      }
      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      }

      const response = await fetch(
        `${config.PREDICATE_API_URL}/v1/task`,
        options,
      )
      if (!response.ok) {
        throw new Error(
          `Failed to fetch predicate signatures: ${response.statusText}`,
        )
      }

      const json = await response.json()
      return json.data
    } catch (error) {
      console.error('Error fetching predicate signatures:', error)
      throw error
    }
  }
}

export const fetchPredicateSignatures = async (
  liquidityContractAddress: string,
  depositor: string,
  recipientPubkey: bigint,
  amount: bigint,
) => {
  const salt = getRandomSalt() // random salt
  const recipientSaltHash = getPubkeySaltHash(recipientPubkey, salt)
  const deposit = {
    depositor,
    recipientSaltHash,
    tokenIndex: 0,
    amount,
    salt,
  }

  const iface = new ethers.Interface(['function depositNativeToken(bytes32)'])
  const encodedArgs = iface.encodeFunctionData("depositNativeToken", [recipientSaltHash]);
  // const encodedArgs = '0x'
  console.log('encodedArgs', encodedArgs)

  const predicateClient = new Predicate()
  const request = {
    from: depositor,
    to: liquidityContractAddress,
    data: encodedArgs,
    msg_value: amount.toString(), // depositNativeToken
  }
  const predicateSignatures = await predicateClient.evaluatePolicy(request)
  console.log('predicateSignatures', predicateSignatures)

  return {
    predicateSignatures,
    deposit,
  }
}

export const encodePredicateSignatures = (
  predicateSignatures: PredicateResponse,
) => {
  const predicateMessage = signaturesToBytes(predicateSignatures)
  const { taskId, expireByBlockNumber, signerAddresses, signatures } =
    predicateMessage
  const abiCoder = new ethers.AbiCoder()
  const encodedPredicateMessage = abiCoder.encode(
    ['string', 'uint256', 'address[]', 'bytes[]'],
    [taskId, expireByBlockNumber, signerAddresses, signatures],
  )

  return encodedPredicateMessage
}
