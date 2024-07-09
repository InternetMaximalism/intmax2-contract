/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IBlockBuilderRegistry,
  IBlockBuilderRegistryInterface,
} from "../../contracts/IBlockBuilderRegistry";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "challenger",
        type: "address",
      },
    ],
    name: "BlockBuilderSlashed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
    ],
    name: "BlockBuilderStoped",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stakeAmount",
        type: "uint256",
      },
    ],
    name: "BlockBuilderUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
    ],
    name: "getBlockBuilder",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "blockBuilderUrl",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "stakeAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stopTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "numSlashes",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isValid",
            type: "bool",
          },
        ],
        internalType: "struct IBlockBuilderRegistry.BlockBuilderInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
    ],
    name: "isValidBlockBuilder",
    outputs: [
      {
        internalType: "bool",
        name: "ok",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
      {
        internalType: "address",
        name: "challenger",
        type: "address",
      },
    ],
    name: "slashBlockBuilder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stopBlockBuilder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
    ],
    name: "updateBlockBuilder",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class IBlockBuilderRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): IBlockBuilderRegistryInterface {
    return new Interface(_abi) as IBlockBuilderRegistryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IBlockBuilderRegistry {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IBlockBuilderRegistry;
  }
}
