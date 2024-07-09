/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ILiquidity,
  ILiquidityInterface,
} from "../../contracts/ILiquidity";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
    ],
    name: "DepositCanceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "recipientSaltHash",
        type: "bytes32",
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
      {
        indexed: false,
        internalType: "uint256",
        name: "requestedAt",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "lastAnalyzedDepositId",
        type: "uint256",
      },
    ],
    name: "DepositsRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "lastProcessedDepositId",
        type: "uint256",
      },
    ],
    name: "DepositsSubmitted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
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
        internalType: "struct ILiquidity.Deposit",
        name: "deposit",
        type: "tuple",
      },
    ],
    name: "cancelPendingDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
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
        internalType: "struct ILiquidity.Deposit",
        name: "deposit",
        type: "tuple",
      },
    ],
    name: "claimRejectedDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "withdrawalIds",
        type: "uint256[]",
      },
    ],
    name: "claimWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "recipientSaltHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositERC1155",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "recipientSaltHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "recipientSaltHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "depositERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recipientSaltHash",
        type: "bytes32",
      },
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getDepositCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastAnalyzedDepositId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastProcessedDepositId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
    ],
    name: "getPendingDeposit",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "depositHash",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "requestedAt",
            type: "uint256",
          },
        ],
        internalType: "struct ILiquidity.DepositData",
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
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
    ],
    name: "getRejectedDeposit",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "depositHash",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "requestedAt",
            type: "uint256",
          },
        ],
        internalType: "struct ILiquidity.DepositData",
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
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address",
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
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
        ],
        internalType: "struct IRollup.Withdrawal[]",
        name: "withdrawals",
        type: "tuple[]",
      },
    ],
    name: "processWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "lastAnalyzedDepositId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "rejectedDepositIds",
        type: "uint256[]",
      },
    ],
    name: "rejectDeposits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "lastProcessedDepositId",
        type: "uint256",
      },
    ],
    name: "submitDeposits",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class ILiquidity__factory {
  static readonly abi = _abi;
  static createInterface(): ILiquidityInterface {
    return new Interface(_abi) as ILiquidityInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): ILiquidity {
    return new Contract(address, _abi, runner) as unknown as ILiquidity;
  }
}