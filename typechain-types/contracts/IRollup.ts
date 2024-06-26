/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export declare namespace IRollup {
  export type WithdrawalStruct = {
    recipient: PromiseOrValue<string>;
    tokenIndex: PromiseOrValue<BigNumberish>;
    amount: PromiseOrValue<BigNumberish>;
    salt: PromiseOrValue<BytesLike>;
  };

  export type WithdrawalStructOutput = [string, number, BigNumber, string] & {
    recipient: string;
    tokenIndex: number;
    amount: BigNumber;
    salt: string;
  };
}

export declare namespace ILiquidity {
  export type DepositStruct = {
    recipientSaltHash: PromiseOrValue<BytesLike>;
    tokenIndex: PromiseOrValue<BigNumberish>;
    amount: PromiseOrValue<BigNumberish>;
  };

  export type DepositStructOutput = [string, number, BigNumber] & {
    recipientSaltHash: string;
    tokenIndex: number;
    amount: BigNumber;
  };
}

export interface IRollupInterface extends utils.Interface {
  functions: {
    "getBlockHash(uint32)": FunctionFragment;
    "getDepositTreeRoot()": FunctionFragment;
    "getLastProcessedWIthdrawalId()": FunctionFragment;
    "postBlock(bool,bytes32,uint128,bytes32,bytes32,uint256[2],uint256[4],uint256[4])": FunctionFragment;
    "postWithdrawRequests((address,uint32,uint256,bytes32)[],uint256[],bytes)": FunctionFragment;
    "processDeposits((bytes32,uint32,uint256)[])": FunctionFragment;
    "submitWithdrawals(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getBlockHash"
      | "getDepositTreeRoot"
      | "getLastProcessedWIthdrawalId"
      | "postBlock"
      | "postWithdrawRequests"
      | "processDeposits"
      | "submitWithdrawals"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getBlockHash",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositTreeRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLastProcessedWIthdrawalId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "postBlock",
    values: [
      PromiseOrValue<boolean>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>,
      [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "postWithdrawRequests",
    values: [
      IRollup.WithdrawalStruct[],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "processDeposits",
    values: [ILiquidity.DepositStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "submitWithdrawals",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "getBlockHash",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositTreeRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLastProcessedWIthdrawalId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "postBlock", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "postWithdrawRequests",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processDeposits",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitWithdrawals",
    data: BytesLike
  ): Result;

  events: {
    "BlockPosted(bytes32,address,uint256,bytes32,bytes32)": EventFragment;
    "WithdrawRequested(bytes32,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BlockPosted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WithdrawRequested"): EventFragment;
}

export interface BlockPostedEventObject {
  prevBlockHash: string;
  blockBuilder: string;
  blockNumber: BigNumber;
  depositTreeRoot: string;
  signatureHash: string;
}
export type BlockPostedEvent = TypedEvent<
  [string, string, BigNumber, string, string],
  BlockPostedEventObject
>;

export type BlockPostedEventFilter = TypedEventFilter<BlockPostedEvent>;

export interface WithdrawRequestedEventObject {
  withdrawalRequest: string;
  withdrawAggregator: string;
}
export type WithdrawRequestedEvent = TypedEvent<
  [string, string],
  WithdrawRequestedEventObject
>;

export type WithdrawRequestedEventFilter =
  TypedEventFilter<WithdrawRequestedEvent>;

export interface IRollup extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IRollupInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getBlockHash(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getDepositTreeRoot(overrides?: CallOverrides): Promise<[string]>;

    getLastProcessedWIthdrawalId(
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    postBlock(
      isRegistrationBlock: PromiseOrValue<boolean>,
      txTreeRoot: PromiseOrValue<BytesLike>,
      senderFlags: PromiseOrValue<BigNumberish>,
      publicKeysHash: PromiseOrValue<BytesLike>,
      accountIdsHash: PromiseOrValue<BytesLike>,
      aggregatedPublicKey: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      aggregatedSignature: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      messagePoint: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    postWithdrawRequests(
      withdrawals: IRollup.WithdrawalStruct[],
      publicInputs: PromiseOrValue<BigNumberish>[],
      proof: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    processDeposits(
      deposits: ILiquidity.DepositStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitWithdrawals(
      lastProcessedWithdrawId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getBlockHash(
    blockNumber: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  getDepositTreeRoot(overrides?: CallOverrides): Promise<string>;

  getLastProcessedWIthdrawalId(overrides?: CallOverrides): Promise<BigNumber>;

  postBlock(
    isRegistrationBlock: PromiseOrValue<boolean>,
    txTreeRoot: PromiseOrValue<BytesLike>,
    senderFlags: PromiseOrValue<BigNumberish>,
    publicKeysHash: PromiseOrValue<BytesLike>,
    accountIdsHash: PromiseOrValue<BytesLike>,
    aggregatedPublicKey: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ],
    aggregatedSignature: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ],
    messagePoint: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  postWithdrawRequests(
    withdrawals: IRollup.WithdrawalStruct[],
    publicInputs: PromiseOrValue<BigNumberish>[],
    proof: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  processDeposits(
    deposits: ILiquidity.DepositStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitWithdrawals(
    lastProcessedWithdrawId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getBlockHash(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    getDepositTreeRoot(overrides?: CallOverrides): Promise<string>;

    getLastProcessedWIthdrawalId(overrides?: CallOverrides): Promise<BigNumber>;

    postBlock(
      isRegistrationBlock: PromiseOrValue<boolean>,
      txTreeRoot: PromiseOrValue<BytesLike>,
      senderFlags: PromiseOrValue<BigNumberish>,
      publicKeysHash: PromiseOrValue<BytesLike>,
      accountIdsHash: PromiseOrValue<BytesLike>,
      aggregatedPublicKey: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      aggregatedSignature: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      messagePoint: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    postWithdrawRequests(
      withdrawals: IRollup.WithdrawalStruct[],
      publicInputs: PromiseOrValue<BigNumberish>[],
      proof: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    processDeposits(
      deposits: ILiquidity.DepositStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    submitWithdrawals(
      lastProcessedWithdrawId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "BlockPosted(bytes32,address,uint256,bytes32,bytes32)"(
      prevBlockHash?: PromiseOrValue<BytesLike> | null,
      blockBuilder?: PromiseOrValue<string> | null,
      blockNumber?: null,
      depositTreeRoot?: null,
      signatureHash?: null
    ): BlockPostedEventFilter;
    BlockPosted(
      prevBlockHash?: PromiseOrValue<BytesLike> | null,
      blockBuilder?: PromiseOrValue<string> | null,
      blockNumber?: null,
      depositTreeRoot?: null,
      signatureHash?: null
    ): BlockPostedEventFilter;

    "WithdrawRequested(bytes32,address)"(
      withdrawalRequest?: PromiseOrValue<BytesLike> | null,
      withdrawAggregator?: null
    ): WithdrawRequestedEventFilter;
    WithdrawRequested(
      withdrawalRequest?: PromiseOrValue<BytesLike> | null,
      withdrawAggregator?: null
    ): WithdrawRequestedEventFilter;
  };

  estimateGas: {
    getBlockHash(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDepositTreeRoot(overrides?: CallOverrides): Promise<BigNumber>;

    getLastProcessedWIthdrawalId(overrides?: CallOverrides): Promise<BigNumber>;

    postBlock(
      isRegistrationBlock: PromiseOrValue<boolean>,
      txTreeRoot: PromiseOrValue<BytesLike>,
      senderFlags: PromiseOrValue<BigNumberish>,
      publicKeysHash: PromiseOrValue<BytesLike>,
      accountIdsHash: PromiseOrValue<BytesLike>,
      aggregatedPublicKey: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      aggregatedSignature: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      messagePoint: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    postWithdrawRequests(
      withdrawals: IRollup.WithdrawalStruct[],
      publicInputs: PromiseOrValue<BigNumberish>[],
      proof: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    processDeposits(
      deposits: ILiquidity.DepositStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitWithdrawals(
      lastProcessedWithdrawId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getBlockHash(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDepositTreeRoot(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLastProcessedWIthdrawalId(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    postBlock(
      isRegistrationBlock: PromiseOrValue<boolean>,
      txTreeRoot: PromiseOrValue<BytesLike>,
      senderFlags: PromiseOrValue<BigNumberish>,
      publicKeysHash: PromiseOrValue<BytesLike>,
      accountIdsHash: PromiseOrValue<BytesLike>,
      aggregatedPublicKey: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      aggregatedSignature: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      messagePoint: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    postWithdrawRequests(
      withdrawals: IRollup.WithdrawalStruct[],
      publicInputs: PromiseOrValue<BigNumberish>[],
      proof: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    processDeposits(
      deposits: ILiquidity.DepositStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitWithdrawals(
      lastProcessedWithdrawId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
