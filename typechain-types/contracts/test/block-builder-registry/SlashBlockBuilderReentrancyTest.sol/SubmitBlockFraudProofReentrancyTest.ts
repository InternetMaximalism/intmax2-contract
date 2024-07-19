/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../../../common";

export declare namespace FraudProofPublicInputsLib {
  export type FraudProofPublicInputsStruct = {
    blockHash: BytesLike;
    blockNumber: BigNumberish;
    challenger: AddressLike;
  };

  export type FraudProofPublicInputsStructOutput = [
    blockHash: string,
    blockNumber: bigint,
    challenger: string
  ] & { blockHash: string; blockNumber: bigint; challenger: string };
}

export interface SubmitBlockFraudProofReentrancyTestInterface
  extends Interface {
  getFunction(nameOrSignature: "submitBlockFraudProof"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "submitBlockFraudProof",
    values: [FraudProofPublicInputsLib.FraudProofPublicInputsStruct, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "submitBlockFraudProof",
    data: BytesLike
  ): Result;
}

export interface SubmitBlockFraudProofReentrancyTest extends BaseContract {
  connect(runner?: ContractRunner | null): SubmitBlockFraudProofReentrancyTest;
  waitForDeployment(): Promise<this>;

  interface: SubmitBlockFraudProofReentrancyTestInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  submitBlockFraudProof: TypedContractMethod<
    [
      publicInputs: FraudProofPublicInputsLib.FraudProofPublicInputsStruct,
      proof: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "submitBlockFraudProof"
  ): TypedContractMethod<
    [
      publicInputs: FraudProofPublicInputsLib.FraudProofPublicInputsStruct,
      proof: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  filters: {};
}
