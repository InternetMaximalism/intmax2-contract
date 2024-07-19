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
import type { NonPayableOverrides } from "../../../common";
import type {
  Withdrawal,
  WithdrawalInterface,
} from "../../../contracts/rollup/Withdrawal";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
    ],
    name: "BlockHashNotExists",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [],
    name: "QueueIsEmpty",
    type: "error",
  },
  {
    inputs: [],
    name: "QueueIsEmpty",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "TooManyRelayClaimableWithdrawals",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "TooManyRelayDirectWithdrawals",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawalAggregatorMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestIndex",
        type: "uint256",
      },
    ],
    name: "WithdrawalBlockHashNotPosted",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawalChainVerificationFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawalProofVerificationFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawalsHashMismatch",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
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
            name: "nullifier",
            type: "bytes32",
          },
        ],
        indexed: false,
        internalType: "struct WithdrawalLib.Withdrawal",
        name: "withdrawal",
        type: "tuple",
      },
    ],
    name: "ClaimableWithdrawalQueued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
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
            name: "nullifier",
            type: "bytes32",
          },
        ],
        indexed: false,
        internalType: "struct WithdrawalLib.Withdrawal",
        name: "withdrawal",
        type: "tuple",
      },
    ],
    name: "DirectWithdrawalQueued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [],
    name: "getClaimableWithdrawalsQueueSize",
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
    name: "getDirectWithdrawalsQueueSize",
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
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "postedBlockHashes",
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
        name: "processUpToId",
        type: "uint256",
      },
    ],
    name: "relayClaimableWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "processUpToId",
        type: "uint256",
      },
    ],
    name: "relayDirectWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
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
            name: "nullifier",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "blockHash",
            type: "bytes32",
          },
        ],
        internalType: "struct ChainedWithdrawalLib.ChainedWithdrawal[]",
        name: "withdrawals",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "lastWithdrawalHash",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "withdrawalAggregator",
            type: "address",
          },
        ],
        internalType:
          "struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs",
        name: "publicInputs",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "submitWithdrawalProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50611c24806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80631f8f9c51146100675780632b8d1b5c1461009757806338d78c78146100b357806380418ca0146100cf5780639ebc2cf6146100eb578063f21161ce14610109575b600080fd5b610081600480360381019061007c9190610f4a565b610127565b60405161008e9190610f90565b60405180910390f35b6100b160048036038101906100ac9190610fd7565b61013f565b005b6100cd60048036038101906100c89190610fd7565b6102c8565b005b6100e960048036038101906100e491906110e3565b61045b565b005b6100f361080e565b6040516101009190610f90565b60405180910390f35b61011161081f565b60405161011e9190610f90565b60405180910390f35b600c6020528060005260406000206000915090505481565b6006600201548111156101555760066002015490505b60006006600101548261016891906111a7565b905060148111156101b057806040517f21a47f9e0000000000000000000000000000000000000000000000000000000081526004016101a79190610f90565b60405180910390fd5b60008167ffffffffffffffff8111156101cc576101cb6111db565b5b6040519080825280602002602001820160405280156101fa5781602001602082028036833780820191505090505b50905060005b8281101561023e576102126006610830565b8282815181106102255761022461120a565b5b6020026020010181815250508080600101915050610200565b50600063a6e2c3c060e01b8260405160240161025a91906112f7565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505090506102c2816108be565b50505050565b6003600201548111156102de5760036002015490505b6000600360010154826102f191906111a7565b9050601481111561033957806040517f26ce64830000000000000000000000000000000000000000000000000000000081526004016103309190610f90565b60405180910390fd5b60008167ffffffffffffffff811115610355576103546111db565b5b60405190808252806020026020018201604052801561038e57816020015b61037b610eb9565b8152602001906001900390816103735790505b50905060005b828110156103d1576103a660036109a8565b8282815181106103b9576103b861120a565b5b60200260200101819052508080600101915050610394565b50600063a6e2c3c060e01b826040516024016103ed919061148c565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050509050610455816108be565b50505050565b6104c883600001358686808060200260200160405190810160405280939291908181526020016000905b828210156104b557848483905060a002018036038101906104a691906115f4565b81526020019060010190610485565b5050505050610ada90919063ffffffff16565b6104fe576040517ffbf63aef00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610506610b46565b73ffffffffffffffffffffffffffffffffffffffff1683602001602081019061052f9190611621565b505060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16637e4f7a8a838361059061058b88803603810190610586919061169e565b610b4e565b610b88565b6040518463ffffffff1660e01b81526004016105ae939291906117c7565b602060405180830381865afa1580156105cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ef9190611838565b610625576040517f38a3efc400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60005b858590508110156108065760008686838181106106485761064761120a565b5b905060a0020180360381019061065e91906115f4565b90506000600c600083608001518152602001908152602001600020505060011515600960008360600151815260200190815260200160002060009054906101000a900460ff161515036106b157506107f9565b6001600960008360600151815260200190815260200160002060006101000a81548160ff02191690831515021790555060006040518060800160405280836000015173ffffffffffffffffffffffffffffffffffffffff168152602001836020015163ffffffff168152602001836040015181526020018360600151815250905061073f8260200151610c33565b1561079b57600061075a826003610c5690919063ffffffff16565b90507f0af6a8ebe64b057b7fcbff08dc274ee360a5ab420d71b826f44bec6d7054eb77818360405161078d9291906118ba565b60405180910390a1506107f6565b60006107b96107a983610d31565b6006610d7790919063ffffffff16565b90507fe11632f77dbd388725302b85b3a1557329e8be0f3207f6defdae78e229a3893681836040516107ec9291906118ba565b60405180910390a1505b50505b8080600101915050610628565b505050505050565b600061081a6003610dcb565b905090565b600061082b6006610de8565b905090565b600061083b82610e05565b15610872576040517f63c3654900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008260000183600101548154811061088e5761088d61120a565b5b906000526020600020015490508260010160008154809291906108b0906118e3565b919050555080915050919050565b6000807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9050600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16635f7b157783600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16858786610951610b46565b6040518763ffffffff1660e01b81526004016109719594939291906119a8565b6000604051808303818588803b15801561098a57600080fd5b505af115801561099e573d6000803e3d6000fd5b5050505050505050565b6109b0610eb9565b6109b982610e19565b156109f0576040517f63c3654900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600082600001836001015481548110610a0c57610a0b61120a565b5b90600052602060002090600302016040518060800160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016000820160149054906101000a900463ffffffff1663ffffffff1663ffffffff168152602001600182015481526020016002820154815250509050826001016000815480929190610acc906118e3565b919050555080915050919050565b6000806000801b905060005b8451811015610b28576000858281518110610b0457610b0361120a565b5b60200260200101519050610b188184610e2d565b9250508080600101915050610ae6565b50828114610b3a576000915050610b40565b60019150505b92915050565b600033905090565b600081600001518260200151604051602001610b6b929190611a6b565b604051602081830303815290604052805190602001209050919050565b60606000600867ffffffffffffffff811115610ba757610ba66111db565b5b604051908082528060200260200182016040528015610bd55781602001602082028036833780820191505090505b50905060005b6008811015610c2957602081610bf19190611a97565b84901b60e01c63ffffffff16828281518110610c1057610c0f61120a565b5b6020026020010181815250508080600101915050610bdb565b5080915050919050565b6000610c4f8263ffffffff16600a610e7c90919063ffffffff16565b9050919050565b60008260000182908060018154018082558091505060019003906000526020600020906003020160009091909190915060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060208201518160000160146101000a81548163ffffffff021916908363ffffffff1602179055506040820151816001015560608201518160020155505082600201549050826002016000815480929190610d26906118e3565b919050555092915050565b60008160000151826020015183604001518460600151604051602001610d5a9493929190611b30565b604051602081830303815290604052805190602001209050919050565b60008260000182908060018154018082558091505060019003906000526020600020016000909190919091505582600201549050826002016000815480929190610dc0906118e3565b919050555092915050565b600081600101548260020154610de191906111a7565b9050919050565b600081600101548260020154610dfe91906111a7565b9050919050565b600081600201548260010154149050919050565b600081600201548260010154149050919050565b60008183600001518460200151856040015186606001518760800151604051602001610e5e96959493929190611b7e565b60405160208183030381529060405280519060200120905092915050565b6000610e8e836000018360001b610e96565b905092915050565b600080836001016000848152602001908152602001600020541415905092915050565b6040518060800160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600063ffffffff16815260200160008152602001600080191681525090565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b610f2781610f14565b8114610f3257600080fd5b50565b600081359050610f4481610f1e565b92915050565b600060208284031215610f6057610f5f610f0a565b5b6000610f6e84828501610f35565b91505092915050565b6000819050919050565b610f8a81610f77565b82525050565b6000602082019050610fa56000830184610f81565b92915050565b610fb481610f77565b8114610fbf57600080fd5b50565b600081359050610fd181610fab565b92915050565b600060208284031215610fed57610fec610f0a565b5b6000610ffb84828501610fc2565b91505092915050565b600080fd5b600080fd5b600080fd5b60008083601f84011261102957611028611004565b5b8235905067ffffffffffffffff81111561104657611045611009565b5b6020830191508360a08202830111156110625761106161100e565b5b9250929050565b600080fd5b60006040828403121561108457611083611069565b5b81905092915050565b60008083601f8401126110a3576110a2611004565b5b8235905067ffffffffffffffff8111156110c0576110bf611009565b5b6020830191508360018202830111156110dc576110db61100e565b5b9250929050565b6000806000806000608086880312156110ff576110fe610f0a565b5b600086013567ffffffffffffffff81111561111d5761111c610f0f565b5b61112988828901611013565b9550955050602061113c8882890161106e565b935050606086013567ffffffffffffffff81111561115d5761115c610f0f565b5b6111698882890161108d565b92509250509295509295909350565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006111b282610f77565b91506111bd83610f77565b92508282039050818111156111d5576111d4611178565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61126e81610f14565b82525050565b60006112808383611265565b60208301905092915050565b6000602082019050919050565b60006112a482611239565b6112ae8185611244565b93506112b983611255565b8060005b838110156112ea5781516112d18882611274565b97506112dc8361128c565b9250506001810190506112bd565b5085935050505092915050565b600060208201905081810360008301526113118184611299565b905092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061137082611345565b9050919050565b61138081611365565b82525050565b600063ffffffff82169050919050565b61139f81611386565b82525050565b6113ae81610f77565b82525050565b6080820160008201516113ca6000850182611377565b5060208201516113dd6020850182611396565b5060408201516113f060408501826113a5565b5060608201516114036060850182611265565b50505050565b600061141583836113b4565b60808301905092915050565b6000602082019050919050565b600061143982611319565b6114438185611324565b935061144e83611335565b8060005b8381101561147f5781516114668882611409565b975061147183611421565b925050600181019050611452565b5085935050505092915050565b600060208201905081810360008301526114a6818461142e565b905092915050565b600080fd5b6000601f19601f8301169050919050565b6114cd826114b3565b810181811067ffffffffffffffff821117156114ec576114eb6111db565b5b80604052505050565b60006114ff610f00565b905061150b82826114c4565b919050565b61151981611365565b811461152457600080fd5b50565b60008135905061153681611510565b92915050565b61154581611386565b811461155057600080fd5b50565b6000813590506115628161153c565b92915050565b600060a0828403121561157e5761157d6114ae565b5b61158860a06114f5565b9050600061159884828501611527565b60008301525060206115ac84828501611553565b60208301525060406115c084828501610fc2565b60408301525060606115d484828501610f35565b60608301525060806115e884828501610f35565b60808301525092915050565b600060a0828403121561160a57611609610f0a565b5b600061161884828501611568565b91505092915050565b60006020828403121561163757611636610f0a565b5b600061164584828501611527565b91505092915050565b600060408284031215611664576116636114ae565b5b61166e60406114f5565b9050600061167e84828501610f35565b600083015250602061169284828501611527565b60208301525092915050565b6000604082840312156116b4576116b3610f0a565b5b60006116c28482850161164e565b91505092915050565b600082825260208201905092915050565b82818337600083830152505050565b60006116f783856116cb565b93506117048385846116dc565b61170d836114b3565b840190509392505050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600061175083836113a5565b60208301905092915050565b6000602082019050919050565b600061177482611718565b61177e8185611723565b935061178983611734565b8060005b838110156117ba5781516117a18882611744565b97506117ac8361175c565b92505060018101905061178d565b5085935050505092915050565b600060408201905081810360008301526117e28185876116eb565b905081810360208301526117f68184611769565b9050949350505050565b60008115159050919050565b61181581611800565b811461182057600080fd5b50565b6000815190506118328161180c565b92915050565b60006020828403121561184e5761184d610f0a565b5b600061185c84828501611823565b91505092915050565b60808201600082015161187b6000850182611377565b50602082015161188e6020850182611396565b5060408201516118a160408501826113a5565b5060608201516118b46060850182611265565b50505050565b600060a0820190506118cf6000830185610f81565b6118dc6020830184611865565b9392505050565b60006118ee82610f77565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036119205761191f611178565b5b600182019050919050565b61193481611365565b82525050565b600081519050919050565b60005b83811015611963578082015181840152602081019050611948565b60008484015250505050565b600061197a8261193a565b61198481856116cb565b9350611994818560208601611945565b61199d816114b3565b840191505092915050565b600060a0820190506119bd600083018861192b565b6119ca6020830187610f81565b81810360408301526119dc818661196f565b90506119eb6060830185610f81565b6119f8608083018461192b565b9695505050505050565b6000819050919050565b611a1d611a1882610f14565b611a02565b82525050565b60008160601b9050919050565b6000611a3b82611a23565b9050919050565b6000611a4d82611a30565b9050919050565b611a65611a6082611365565b611a42565b82525050565b6000611a778285611a0c565b602082019150611a878284611a54565b6014820191508190509392505050565b6000611aa282610f77565b9150611aad83610f77565b9250828202611abb81610f77565b91508282048414831517611ad257611ad1611178565b5b5092915050565b60008160e01b9050919050565b6000611af182611ad9565b9050919050565b611b09611b0482611386565b611ae6565b82525050565b6000819050919050565b611b2a611b2582610f77565b611b0f565b82525050565b6000611b3c8287611a54565b601482019150611b4c8286611af8565b600482019150611b5c8285611b19565b602082019150611b6c8284611a0c565b60208201915081905095945050505050565b6000611b8a8289611a0c565b602082019150611b9a8288611a54565b601482019150611baa8287611af8565b600482019150611bba8286611b19565b602082019150611bca8285611a0c565b602082019150611bda8284611a0c565b60208201915081905097965050505050505056fea264697066735822122039afdb7bef19f23e46d172e85f67fa4a713f1a8b75d044db4481100200c9d11b64736f6c63430008180033";

type WithdrawalConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WithdrawalConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Withdrawal__factory extends ContractFactory {
  constructor(...args: WithdrawalConstructorParams) {
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
      Withdrawal & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): Withdrawal__factory {
    return super.connect(runner) as Withdrawal__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WithdrawalInterface {
    return new Interface(_abi) as WithdrawalInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): Withdrawal {
    return new Contract(address, _abi, runner) as unknown as Withdrawal;
  }
}