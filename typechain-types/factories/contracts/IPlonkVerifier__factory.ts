/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPlonkVerifier,
  IPlonkVerifierInterface,
} from "../../contracts/IPlonkVerifier";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
      {
        internalType: "uint256[]",
        name: "public_inputs",
        type: "uint256[]",
      },
    ],
    name: "Verify",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IPlonkVerifier__factory {
  static readonly abi = _abi;
  static createInterface(): IPlonkVerifierInterface {
    return new Interface(_abi) as IPlonkVerifierInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IPlonkVerifier {
    return new Contract(address, _abi, runner) as unknown as IPlonkVerifier;
  }
}