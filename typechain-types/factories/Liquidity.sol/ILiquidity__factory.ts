/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ILiquidity,
  ILiquidityInterface,
} from "../../Liquidity.sol/ILiquidity";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "recipient",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "depositIndex",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "tokenIndex",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recipient",
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
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class ILiquidity__factory {
  static readonly abi = _abi;
  static createInterface(): ILiquidityInterface {
    return new utils.Interface(_abi) as ILiquidityInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ILiquidity {
    return new Contract(address, _abi, signerOrProvider) as ILiquidity;
  }
}
