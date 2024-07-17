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
} from "../../../common";

export declare namespace IBlockBuilderRegistry {
  export type BlockBuilderInfoStruct = {
    blockBuilderUrl: string;
    stakeAmount: BigNumberish;
    stopTime: BigNumberish;
    numSlashes: BigNumberish;
    isValid: boolean;
  };

  export type BlockBuilderInfoStructOutput = [
    blockBuilderUrl: string,
    stakeAmount: bigint,
    stopTime: bigint,
    numSlashes: bigint,
    isValid: boolean
  ] & {
    blockBuilderUrl: string;
    stakeAmount: bigint;
    stopTime: bigint;
    numSlashes: bigint;
    isValid: boolean;
  };
}

export interface BlockBuilderInfoLibTestInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "isChallengeDuration"
      | "isStakeAmountSufficient"
      | "isStaking"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "isChallengeDuration",
    values: [IBlockBuilderRegistry.BlockBuilderInfoStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "isStakeAmountSufficient",
    values: [IBlockBuilderRegistry.BlockBuilderInfoStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "isStaking",
    values: [IBlockBuilderRegistry.BlockBuilderInfoStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "isChallengeDuration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isStakeAmountSufficient",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isStaking", data: BytesLike): Result;
}

export interface BlockBuilderInfoLibTest extends BaseContract {
  connect(runner?: ContractRunner | null): BlockBuilderInfoLibTest;
  waitForDeployment(): Promise<this>;

  interface: BlockBuilderInfoLibTestInterface;

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

  isChallengeDuration: TypedContractMethod<
    [info: IBlockBuilderRegistry.BlockBuilderInfoStruct],
    [boolean],
    "view"
  >;

  isStakeAmountSufficient: TypedContractMethod<
    [info: IBlockBuilderRegistry.BlockBuilderInfoStruct],
    [boolean],
    "view"
  >;

  isStaking: TypedContractMethod<
    [info: IBlockBuilderRegistry.BlockBuilderInfoStruct],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "isChallengeDuration"
  ): TypedContractMethod<
    [info: IBlockBuilderRegistry.BlockBuilderInfoStruct],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isStakeAmountSufficient"
  ): TypedContractMethod<
    [info: IBlockBuilderRegistry.BlockBuilderInfoStruct],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isStaking"
  ): TypedContractMethod<
    [info: IBlockBuilderRegistry.BlockBuilderInfoStruct],
    [boolean],
    "view"
  >;

  filters: {};
}