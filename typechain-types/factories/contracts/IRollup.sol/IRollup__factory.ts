/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IRollup,
  IRollupInterface,
} from "../../../contracts/IRollup.sol/IRollup";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "prevBlockHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "depositTreeRoot",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "signatureHash",
        type: "bytes32",
      },
    ],
    name: "BlockPosted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "blockNumber",
        type: "uint32",
      },
    ],
    name: "getBlockHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDepositTreeRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "isRegistrationBlock",
        type: "bool",
      },
      {
        internalType: "bytes32",
        name: "txTreeRoot",
        type: "bytes32",
      },
      {
        internalType: "uint128",
        name: "senderFlags",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "publicKeysHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "accountIdsHash",
        type: "bytes32",
      },
      {
        internalType: "uint256[2]",
        name: "aggregatedPublicKey",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[4]",
        name: "aggregatedSignature",
        type: "uint256[4]",
      },
      {
        internalType: "uint256[4]",
        name: "messagePoint",
        type: "uint256[4]",
      },
    ],
    name: "postBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "recipientSaltHash",
            type: "bytes32",
          },
          {
            internalType: "uint32",
            name: "tokenIndex",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct ILiquidity.Deposit[]",
        name: "deposits",
        type: "tuple[]",
      },
    ],
    name: "updateDepositTreeRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IRollup__factory {
  static readonly abi = _abi;
  static createInterface(): IRollupInterface {
    return new utils.Interface(_abi) as IRollupInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IRollup {
    return new Contract(address, _abi, signerOrProvider) as IRollup;
  }
}
