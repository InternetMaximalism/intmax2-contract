/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  BigNumberish,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  MockL1GasPriceOracle,
  MockL1GasPriceOracleInterface,
} from "../../../contracts/mock/MockL1GasPriceOracle";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "baseFee",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "l1BaseFee",
        type: "uint256",
      },
    ],
    name: "L1BaseFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "overhead",
        type: "uint256",
      },
    ],
    name: "OverheadUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "scalar",
        type: "uint256",
      },
    ],
    name: "ScalarUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "getL1Fee",
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
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "getL1GasUsed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "l1BaseFee",
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
    name: "overhead",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "scalar",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "setL1BaseFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b506040516104d73803806104d78339818101604052810190610032919061007b565b8060808181525050506100a8565b600080fd5b6000819050919050565b61005881610045565b811461006357600080fd5b50565b6000815190506100758161004f565b92915050565b60006020828403121561009157610090610040565b5b600061009f84828501610066565b91505092915050565b60805161040d6100ca600039600081816101460152610170015261040d6000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80630c18c1621461006757806349948e0e14610085578063519b4bd3146100b5578063bede39b5146100d3578063de26c4a1146100ef578063f45e65d81461011f575b600080fd5b61006f61013d565b60405161007c91906101c0565b60405180910390f35b61009f600480360381019061009a9190610335565b610142565b6040516100ac91906101c0565b60405180910390f35b6100bd61016c565b6040516100ca91906101c0565b60405180910390f35b6100ed60048036038101906100e891906103aa565b610194565b005b61010960048036038101906101049190610335565b610197565b60405161011691906101c0565b60405180910390f35b61012761019e565b60405161013491906101c0565b60405180910390f35b600090565b60007f00000000000000000000000000000000000000000000000000000000000000009050919050565b60007f0000000000000000000000000000000000000000000000000000000000000000905090565b50565b6000919050565b60006001905090565b6000819050919050565b6101ba816101a7565b82525050565b60006020820190506101d560008301846101b1565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610242826101f9565b810181811067ffffffffffffffff821117156102615761026061020a565b5b80604052505050565b60006102746101db565b90506102808282610239565b919050565b600067ffffffffffffffff8211156102a05761029f61020a565b5b6102a9826101f9565b9050602081019050919050565b82818337600083830152505050565b60006102d86102d384610285565b61026a565b9050828152602081018484840111156102f4576102f36101f4565b5b6102ff8482856102b6565b509392505050565b600082601f83011261031c5761031b6101ef565b5b813561032c8482602086016102c5565b91505092915050565b60006020828403121561034b5761034a6101e5565b5b600082013567ffffffffffffffff811115610369576103686101ea565b5b61037584828501610307565b91505092915050565b610387816101a7565b811461039257600080fd5b50565b6000813590506103a48161037e565b92915050565b6000602082840312156103c0576103bf6101e5565b5b60006103ce84828501610395565b9150509291505056fea2646970667358221220b677f3eb9c705c080e532e318bab53bf74193797423c8285000b174bd98b0ea064736f6c63430008180033";

type MockL1GasPriceOracleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockL1GasPriceOracleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockL1GasPriceOracle__factory extends ContractFactory {
  constructor(...args: MockL1GasPriceOracleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    baseFee: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(baseFee, overrides || {});
  }
  override deploy(
    baseFee: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(baseFee, overrides || {}) as Promise<
      MockL1GasPriceOracle & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): MockL1GasPriceOracle__factory {
    return super.connect(runner) as MockL1GasPriceOracle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockL1GasPriceOracleInterface {
    return new Interface(_abi) as MockL1GasPriceOracleInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): MockL1GasPriceOracle {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as MockL1GasPriceOracle;
  }
}
