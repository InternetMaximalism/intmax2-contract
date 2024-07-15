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
  AddressLike,
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

export declare namespace IRollup {
  export type WithdrawalStruct = {
    recipient: AddressLike;
    tokenIndex: BigNumberish;
    amount: BigNumberish;
    salt: BytesLike;
    blockHash: BytesLike;
  };

  export type WithdrawalStructOutput = [
    recipient: string,
    tokenIndex: bigint,
    amount: bigint,
    salt: string,
    blockHash: string
  ] & {
    recipient: string;
    tokenIndex: bigint;
    amount: bigint;
    salt: string;
    blockHash: string;
  };

  export type WithdrawalProofPublicInputsStruct = {
    withdrawalTreeRoot: BytesLike;
    withdrawalAggregator: AddressLike;
  };

  export type WithdrawalProofPublicInputsStructOutput = [
    withdrawalTreeRoot: string,
    withdrawalAggregator: string
  ] & { withdrawalTreeRoot: string; withdrawalAggregator: string };

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

export interface IRollupInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "postNonRegistrationBlock"
      | "postRegistrationBlock"
      | "postWithdrawalRequests"
      | "processDeposits"
      | "submitBlockFraudProof"
      | "submitWithdrawals"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "BlockFraudProofSubmitted"
      | "BlockPosted"
      | "DepositsProcessed"
      | "WithdrawRequested"
      | "WithdrawalsSubmitted"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "postNonRegistrationBlock",
    values: [
      BytesLike,
      BigNumberish,
      BytesLike,
      BytesLike,
      [BigNumberish, BigNumberish],
      [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "postRegistrationBlock",
    values: [
      BytesLike,
      BigNumberish,
      BytesLike,
      [BigNumberish, BigNumberish],
      [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      BigNumberish[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "postWithdrawalRequests",
    values: [
      IRollup.WithdrawalStruct[],
      IRollup.WithdrawalProofPublicInputsStruct,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "processDeposits",
    values: [BigNumberish, BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "submitBlockFraudProof",
    values: [IRollup.FraudProofPublicInputsStruct, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "submitWithdrawals",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "postNonRegistrationBlock",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "postRegistrationBlock",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "postWithdrawalRequests",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processDeposits",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitBlockFraudProof",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitWithdrawals",
    data: BytesLike
  ): Result;
}

export namespace BlockFraudProofSubmittedEvent {
  export type InputTuple = [
    blockNumber: BigNumberish,
    blockBuilder: AddressLike,
    challenger: AddressLike
  ];
  export type OutputTuple = [
    blockNumber: bigint,
    blockBuilder: string,
    challenger: string
  ];
  export interface OutputObject {
    blockNumber: bigint;
    blockBuilder: string;
    challenger: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BlockPostedEvent {
  export type InputTuple = [
    prevBlockHash: BytesLike,
    blockBuilder: AddressLike,
    blockNumber: BigNumberish,
    depositTreeRoot: BytesLike,
    signatureHash: BytesLike
  ];
  export type OutputTuple = [
    prevBlockHash: string,
    blockBuilder: string,
    blockNumber: bigint,
    depositTreeRoot: string,
    signatureHash: string
  ];
  export interface OutputObject {
    prevBlockHash: string;
    blockBuilder: string;
    blockNumber: bigint;
    depositTreeRoot: string;
    signatureHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DepositsProcessedEvent {
  export type InputTuple = [depositTreeRoot: BytesLike];
  export type OutputTuple = [depositTreeRoot: string];
  export interface OutputObject {
    depositTreeRoot: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WithdrawRequestedEvent {
  export type InputTuple = [
    withdrawalRequest: BytesLike,
    withdrawalAggregator: AddressLike
  ];
  export type OutputTuple = [
    withdrawalRequest: string,
    withdrawalAggregator: string
  ];
  export interface OutputObject {
    withdrawalRequest: string;
    withdrawalAggregator: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WithdrawalsSubmittedEvent {
  export type InputTuple = [
    startProcessedWithdrawId: BigNumberish,
    lastProcessedWithdrawId: BigNumberish
  ];
  export type OutputTuple = [
    startProcessedWithdrawId: bigint,
    lastProcessedWithdrawId: bigint
  ];
  export interface OutputObject {
    startProcessedWithdrawId: bigint;
    lastProcessedWithdrawId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IRollup extends BaseContract {
  connect(runner?: ContractRunner | null): IRollup;
  waitForDeployment(): Promise<this>;

  interface: IRollupInterface;

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

  postNonRegistrationBlock: TypedContractMethod<
    [
      txTreeRoot: BytesLike,
      senderFlags: BigNumberish,
      publicKeysHash: BytesLike,
      accountIdsHash: BytesLike,
      aggregatedPublicKey: [BigNumberish, BigNumberish],
      aggregatedSignature: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      messagePoint: [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      senderAccountIds: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  postRegistrationBlock: TypedContractMethod<
    [
      txTreeRoot: BytesLike,
      senderFlags: BigNumberish,
      publicKeysHash: BytesLike,
      aggregatedPublicKey: [BigNumberish, BigNumberish],
      aggregatedSignature: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      messagePoint: [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      senderPublicKeys: BigNumberish[]
    ],
    [void],
    "nonpayable"
  >;

  postWithdrawalRequests: TypedContractMethod<
    [
      withdrawals: IRollup.WithdrawalStruct[],
      publicInputs: IRollup.WithdrawalProofPublicInputsStruct,
      proof: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  processDeposits: TypedContractMethod<
    [lastProcessedDepositId: BigNumberish, depositHashes: BytesLike[]],
    [void],
    "nonpayable"
  >;

  submitBlockFraudProof: TypedContractMethod<
    [publicInputs: IRollup.FraudProofPublicInputsStruct, proof: BytesLike],
    [void],
    "nonpayable"
  >;

  submitWithdrawals: TypedContractMethod<
    [lastProcessedWithdrawId: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "postNonRegistrationBlock"
  ): TypedContractMethod<
    [
      txTreeRoot: BytesLike,
      senderFlags: BigNumberish,
      publicKeysHash: BytesLike,
      accountIdsHash: BytesLike,
      aggregatedPublicKey: [BigNumberish, BigNumberish],
      aggregatedSignature: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      messagePoint: [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      senderAccountIds: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "postRegistrationBlock"
  ): TypedContractMethod<
    [
      txTreeRoot: BytesLike,
      senderFlags: BigNumberish,
      publicKeysHash: BytesLike,
      aggregatedPublicKey: [BigNumberish, BigNumberish],
      aggregatedSignature: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      messagePoint: [BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      senderPublicKeys: BigNumberish[]
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "postWithdrawalRequests"
  ): TypedContractMethod<
    [
      withdrawals: IRollup.WithdrawalStruct[],
      publicInputs: IRollup.WithdrawalProofPublicInputsStruct,
      proof: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "processDeposits"
  ): TypedContractMethod<
    [lastProcessedDepositId: BigNumberish, depositHashes: BytesLike[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "submitBlockFraudProof"
  ): TypedContractMethod<
    [publicInputs: IRollup.FraudProofPublicInputsStruct, proof: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "submitWithdrawals"
  ): TypedContractMethod<
    [lastProcessedWithdrawId: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "BlockFraudProofSubmitted"
  ): TypedContractEvent<
    BlockFraudProofSubmittedEvent.InputTuple,
    BlockFraudProofSubmittedEvent.OutputTuple,
    BlockFraudProofSubmittedEvent.OutputObject
  >;
  getEvent(
    key: "BlockPosted"
  ): TypedContractEvent<
    BlockPostedEvent.InputTuple,
    BlockPostedEvent.OutputTuple,
    BlockPostedEvent.OutputObject
  >;
  getEvent(
    key: "DepositsProcessed"
  ): TypedContractEvent<
    DepositsProcessedEvent.InputTuple,
    DepositsProcessedEvent.OutputTuple,
    DepositsProcessedEvent.OutputObject
  >;
  getEvent(
    key: "WithdrawRequested"
  ): TypedContractEvent<
    WithdrawRequestedEvent.InputTuple,
    WithdrawRequestedEvent.OutputTuple,
    WithdrawRequestedEvent.OutputObject
  >;
  getEvent(
    key: "WithdrawalsSubmitted"
  ): TypedContractEvent<
    WithdrawalsSubmittedEvent.InputTuple,
    WithdrawalsSubmittedEvent.OutputTuple,
    WithdrawalsSubmittedEvent.OutputObject
  >;

  filters: {
    "BlockFraudProofSubmitted(uint32,address,address)": TypedContractEvent<
      BlockFraudProofSubmittedEvent.InputTuple,
      BlockFraudProofSubmittedEvent.OutputTuple,
      BlockFraudProofSubmittedEvent.OutputObject
    >;
    BlockFraudProofSubmitted: TypedContractEvent<
      BlockFraudProofSubmittedEvent.InputTuple,
      BlockFraudProofSubmittedEvent.OutputTuple,
      BlockFraudProofSubmittedEvent.OutputObject
    >;

    "BlockPosted(bytes32,address,uint256,bytes32,bytes32)": TypedContractEvent<
      BlockPostedEvent.InputTuple,
      BlockPostedEvent.OutputTuple,
      BlockPostedEvent.OutputObject
    >;
    BlockPosted: TypedContractEvent<
      BlockPostedEvent.InputTuple,
      BlockPostedEvent.OutputTuple,
      BlockPostedEvent.OutputObject
    >;

    "DepositsProcessed(bytes32)": TypedContractEvent<
      DepositsProcessedEvent.InputTuple,
      DepositsProcessedEvent.OutputTuple,
      DepositsProcessedEvent.OutputObject
    >;
    DepositsProcessed: TypedContractEvent<
      DepositsProcessedEvent.InputTuple,
      DepositsProcessedEvent.OutputTuple,
      DepositsProcessedEvent.OutputObject
    >;

    "WithdrawRequested(bytes32,address)": TypedContractEvent<
      WithdrawRequestedEvent.InputTuple,
      WithdrawRequestedEvent.OutputTuple,
      WithdrawRequestedEvent.OutputObject
    >;
    WithdrawRequested: TypedContractEvent<
      WithdrawRequestedEvent.InputTuple,
      WithdrawRequestedEvent.OutputTuple,
      WithdrawRequestedEvent.OutputObject
    >;

    "WithdrawalsSubmitted(uint256,uint256)": TypedContractEvent<
      WithdrawalsSubmittedEvent.InputTuple,
      WithdrawalsSubmittedEvent.OutputTuple,
      WithdrawalsSubmittedEvent.OutputObject
    >;
    WithdrawalsSubmitted: TypedContractEvent<
      WithdrawalsSubmittedEvent.InputTuple,
      WithdrawalsSubmittedEvent.OutputTuple,
      WithdrawalsSubmittedEvent.OutputObject
    >;
  };
}
