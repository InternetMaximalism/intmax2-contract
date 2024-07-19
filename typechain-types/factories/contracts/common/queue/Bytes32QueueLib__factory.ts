/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  Bytes32QueueLib,
  Bytes32QueueLibInterface,
} from "../../../../contracts/common/queue/Bytes32QueueLib";

const _abi = [
  {
    inputs: [],
    name: "QueueIsEmpty",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566050600b82828239805160001a6073146043577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea2646970667358221220ce98d43ac711c2062fd30960dd6df844af42c1686e82ff3ac8c6d768d596315c64736f6c63430008180033";

type Bytes32QueueLibConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: Bytes32QueueLibConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Bytes32QueueLib__factory extends ContractFactory {
  constructor(...args: Bytes32QueueLibConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      Bytes32QueueLib & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): Bytes32QueueLib__factory {
    return super.connect(runner) as Bytes32QueueLib__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): Bytes32QueueLibInterface {
    return new Interface(_abi) as Bytes32QueueLibInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): Bytes32QueueLib {
    return new Contract(address, _abi, runner) as unknown as Bytes32QueueLib;
  }
}
