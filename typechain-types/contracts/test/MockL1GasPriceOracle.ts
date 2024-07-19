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
  EventFragment,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface MockL1GasPriceOracleInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "getL1Fee"
      | "getL1GasUsed"
      | "l1BaseFee"
      | "overhead"
      | "scalar"
      | "setL1BaseFee"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "L1BaseFeeUpdated"
      | "OverheadUpdated"
      | "ScalarUpdated"
  ): EventFragment;

  encodeFunctionData(functionFragment: "getL1Fee", values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: "getL1GasUsed",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "l1BaseFee", values?: undefined): string;
  encodeFunctionData(functionFragment: "overhead", values?: undefined): string;
  encodeFunctionData(functionFragment: "scalar", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setL1BaseFee",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "getL1Fee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getL1GasUsed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "l1BaseFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "overhead", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "scalar", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setL1BaseFee",
    data: BytesLike
  ): Result;
}

export namespace L1BaseFeeUpdatedEvent {
  export type InputTuple = [l1BaseFee: BigNumberish];
  export type OutputTuple = [l1BaseFee: bigint];
  export interface OutputObject {
    l1BaseFee: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OverheadUpdatedEvent {
  export type InputTuple = [overhead: BigNumberish];
  export type OutputTuple = [overhead: bigint];
  export interface OutputObject {
    overhead: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ScalarUpdatedEvent {
  export type InputTuple = [scalar: BigNumberish];
  export type OutputTuple = [scalar: bigint];
  export interface OutputObject {
    scalar: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface MockL1GasPriceOracle extends BaseContract {
  connect(runner?: ContractRunner | null): MockL1GasPriceOracle;
  waitForDeployment(): Promise<this>;

  interface: MockL1GasPriceOracleInterface;

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

  getL1Fee: TypedContractMethod<[arg0: BytesLike], [bigint], "view">;

  getL1GasUsed: TypedContractMethod<[arg0: BytesLike], [bigint], "view">;

  l1BaseFee: TypedContractMethod<[], [bigint], "view">;

  overhead: TypedContractMethod<[], [bigint], "view">;

  scalar: TypedContractMethod<[], [bigint], "view">;

  setL1BaseFee: TypedContractMethod<[arg0: BigNumberish], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "getL1Fee"
  ): TypedContractMethod<[arg0: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getL1GasUsed"
  ): TypedContractMethod<[arg0: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "l1BaseFee"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "overhead"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "scalar"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "setL1BaseFee"
  ): TypedContractMethod<[arg0: BigNumberish], [void], "nonpayable">;

  getEvent(
    key: "L1BaseFeeUpdated"
  ): TypedContractEvent<
    L1BaseFeeUpdatedEvent.InputTuple,
    L1BaseFeeUpdatedEvent.OutputTuple,
    L1BaseFeeUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "OverheadUpdated"
  ): TypedContractEvent<
    OverheadUpdatedEvent.InputTuple,
    OverheadUpdatedEvent.OutputTuple,
    OverheadUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "ScalarUpdated"
  ): TypedContractEvent<
    ScalarUpdatedEvent.InputTuple,
    ScalarUpdatedEvent.OutputTuple,
    ScalarUpdatedEvent.OutputObject
  >;

  filters: {
    "L1BaseFeeUpdated(uint256)": TypedContractEvent<
      L1BaseFeeUpdatedEvent.InputTuple,
      L1BaseFeeUpdatedEvent.OutputTuple,
      L1BaseFeeUpdatedEvent.OutputObject
    >;
    L1BaseFeeUpdated: TypedContractEvent<
      L1BaseFeeUpdatedEvent.InputTuple,
      L1BaseFeeUpdatedEvent.OutputTuple,
      L1BaseFeeUpdatedEvent.OutputObject
    >;

    "OverheadUpdated(uint256)": TypedContractEvent<
      OverheadUpdatedEvent.InputTuple,
      OverheadUpdatedEvent.OutputTuple,
      OverheadUpdatedEvent.OutputObject
    >;
    OverheadUpdated: TypedContractEvent<
      OverheadUpdatedEvent.InputTuple,
      OverheadUpdatedEvent.OutputTuple,
      OverheadUpdatedEvent.OutputObject
    >;

    "ScalarUpdated(uint256)": TypedContractEvent<
      ScalarUpdatedEvent.InputTuple,
      ScalarUpdatedEvent.OutputTuple,
      ScalarUpdatedEvent.OutputObject
    >;
    ScalarUpdated: TypedContractEvent<
      ScalarUpdatedEvent.InputTuple,
      ScalarUpdatedEvent.OutputTuple,
      ScalarUpdatedEvent.OutputObject
    >;
  };
}
