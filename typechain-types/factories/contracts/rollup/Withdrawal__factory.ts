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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
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
            internalType: "bytes32",
            name: "prevWithdrawalHash",
            type: "bytes32",
          },
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
    name: "postWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "relayClaimableWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "relayDirectWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50611e0c806100206000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80638da5cb5b1161005b5780638da5cb5b146100d8578063c57ca915146100f6578063e4f0379814610100578063f2fde38b1461010a5761007d565b80631f8f9c51146100825780636792f87a146100b2578063715018a6146100ce575b600080fd5b61009c600480360381019061009791906110e8565b610126565b6040516100a9919061112e565b60405180910390f35b6100cc60048036038101906100c79190611228565b61013e565b005b6100d6610626565b005b6100e061063a565b6040516100ed91906112fe565b60405180910390f35b6100fe610672565b005b6101086108ae565b005b610124600480360381019061011f9190611345565b610be4565b005b60056020528060005260406000206000915090505481565b6101ab83600001358686808060200260200160405190810160405280939291908181526020016000905b8282101561019857848483905060c00201803603810190610189919061150b565b81526020019060010190610168565b5050505050610c6a90919063ffffffff16565b6101e1576040517ffbf63aef00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6101e9610cec565b73ffffffffffffffffffffffffffffffffffffffff168360200160208101906102129190611345565b73ffffffffffffffffffffffffffffffffffffffff161461025f576040517fbe8e6d9600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16637e4f7a8a83836102c06102bb888036038101906102b69190611588565b610cf4565b610d2e565b6040518463ffffffff1660e01b81526004016102de939291906116c0565b602060405180830381865afa1580156102fb573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061031f9190611731565b610355576040517f38a3efc400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60005b8585905081101561061e5760008686838181106103785761037761175e565b5b905060c0020180360381019061038e919061150b565b90506000600560008360a00151815260200190815260200160002054036103f0578060a001516040517f631b89b00000000000000000000000000000000000000000000000000000000081526004016103e7919061179c565b60405180910390fd5b60011515600260008360800151815260200190815260200160002060009054906101000a900460ff161515036104265750610611565b6001600260008360800151815260200190815260200160002060006101000a81548160ff02191690831515021790555060006040518060800160405280836020015173ffffffffffffffffffffffffffffffffffffffff168152602001836040015163ffffffff16815260200183606001518152602001836080015181525090506104b48260400151610dd9565b156105a557600081908060018154018082558091505060019003906000526020600020906003020160009091909190915060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060208201518160000160146101000a81548163ffffffff021916908363ffffffff160217905550604082015181600101556060820151816002015550507fd9106442c97b764fa4070229c5167ea28888d90803d276b9d3d6461296945cee816040516105989190611839565b60405180910390a161060e565b60016105b082610dfc565b90806001815401808255809150506001900390600052602060002001600090919091909150557fb9a024ce5233e25c9dc00bd86bd8a44865c4e021660d4d11bf81ee1454324fa7816040516106059190611839565b60405180910390a15b50505b8080600101915050610358565b505050505050565b61062e610e42565b6106386000610ec9565b565b600080610645610fa0565b90508060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1691505090565b6000600180549050905060006064821161068c578161068f565b60645b905060008167ffffffffffffffff8111156106ad576106ac611388565b5b6040519080825280602002602001820160405280156106db5781602001602082028036833780820191505090505b50905060005b8281101561076b5760018080805490506106fb9190611883565b8154811061070c5761070b61175e565b5b906000526020600020015482828151811061072a5761072961175e565b5b6020026020010181815250506001805480610748576107476118b7565b5b6001900381819060005260206000200160009055905580806001019150506106e1565b50600063a6e2c3c060e01b826040516024016107879190611995565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050509050600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16635f7b15776000600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166000856000610856610cec565b6040518763ffffffff1660e01b8152600401610876959493929190611a6a565b6000604051808303818588803b15801561088f57600080fd5b505af11580156108a3573d6000803e3d6000fd5b505050505050505050565b6000808054905090506000601482116108c757816108ca565b60145b905060008167ffffffffffffffff8111156108e8576108e7611388565b5b60405190808252806020026020018201604052801561092157816020015b61090e611057565b8152602001906001900390816109065790505b50905060005b82811015610aa157600060016000805490506109439190611883565b815481106109545761095361175e565b5b90600052602060002090600302016040518060800160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016000820160149054906101000a900463ffffffff1663ffffffff1663ffffffff16815260200160018201548152602001600282015481525050828281518110610a1057610a0f61175e565b5b60200260200101819052506000805480610a2d57610a2c6118b7565b5b6001900381819060005260206000209060030201600080820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556000820160146101000a81549063ffffffff021916905560018201600090556002820160009055505090558080600101915050610927565b50600063aafaed3a60e01b82604051602401610abd9190611bc8565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050509050600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16635f7b15776000600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166000856000610b8c610cec565b6040518763ffffffff1660e01b8152600401610bac959493929190611a6a565b6000604051808303818588803b158015610bc557600080fd5b505af1158015610bd9573d6000803e3d6000fd5b505050505050505050565b610bec610e42565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610c5e5760006040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600401610c5591906112fe565b60405180910390fd5b610c6781610ec9565b50565b6000806000801b905060005b8451811015610cce576000858281518110610c9457610c9361175e565b5b6020026020010151905082816000015114610cb55760009350505050610ce6565b610cbe81610fc8565b9250508080600101915050610c76565b50828114610ce0576000915050610ce6565b60019150505b92915050565b600033905090565b600081600001518260200151604051602001610d11929190611c53565b604051602081830303815290604052805190602001209050919050565b60606000600867ffffffffffffffff811115610d4d57610d4c611388565b5b604051908082528060200260200182016040528015610d7b5781602001602082028036833780820191505090505b50905060005b6008811015610dcf57602081610d979190611c7f565b84901b60e01c63ffffffff16828281518110610db657610db561175e565b5b6020026020010181815250508080600101915050610d81565b5080915050919050565b6000610df58263ffffffff16600361101a90919063ffffffff16565b9050919050565b60008160000151826020015183604001518460600151604051602001610e259493929190611d18565b604051602081830303815290604052805190602001209050919050565b610e4a610cec565b73ffffffffffffffffffffffffffffffffffffffff16610e6861063a565b73ffffffffffffffffffffffffffffffffffffffff1614610ec757610e8b610cec565b6040517f118cdaa7000000000000000000000000000000000000000000000000000000008152600401610ebe91906112fe565b60405180910390fd5b565b6000610ed3610fa0565b905060008160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050828260000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508273ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3505050565b60007f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c199300905090565b6000816000015182602001518360400151846060015185608001518660a00151604051602001610ffd96959493929190611d66565b604051602081830303815290604052805190602001209050919050565b600061102c836000018360001b611034565b905092915050565b600080836001016000848152602001908152602001600020541415905092915050565b6040518060800160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600063ffffffff16815260200160008152602001600080191681525090565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6110c5816110b2565b81146110d057600080fd5b50565b6000813590506110e2816110bc565b92915050565b6000602082840312156110fe576110fd6110a8565b5b600061110c848285016110d3565b91505092915050565b6000819050919050565b61112881611115565b82525050565b6000602082019050611143600083018461111f565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f84011261116e5761116d611149565b5b8235905067ffffffffffffffff81111561118b5761118a61114e565b5b6020830191508360c08202830111156111a7576111a6611153565b5b9250929050565b600080fd5b6000604082840312156111c9576111c86111ae565b5b81905092915050565b60008083601f8401126111e8576111e7611149565b5b8235905067ffffffffffffffff8111156112055761120461114e565b5b60208301915083600182028301111561122157611220611153565b5b9250929050565b600080600080600060808688031215611244576112436110a8565b5b600086013567ffffffffffffffff811115611262576112616110ad565b5b61126e88828901611158565b95509550506020611281888289016111b3565b935050606086013567ffffffffffffffff8111156112a2576112a16110ad565b5b6112ae888289016111d2565b92509250509295509295909350565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006112e8826112bd565b9050919050565b6112f8816112dd565b82525050565b600060208201905061131360008301846112ef565b92915050565b611322816112dd565b811461132d57600080fd5b50565b60008135905061133f81611319565b92915050565b60006020828403121561135b5761135a6110a8565b5b600061136984828501611330565b91505092915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6113c082611377565b810181811067ffffffffffffffff821117156113df576113de611388565b5b80604052505050565b60006113f261109e565b90506113fe82826113b7565b919050565b600063ffffffff82169050919050565b61141c81611403565b811461142757600080fd5b50565b60008135905061143981611413565b92915050565b61144881611115565b811461145357600080fd5b50565b6000813590506114658161143f565b92915050565b600060c0828403121561148157611480611372565b5b61148b60c06113e8565b9050600061149b848285016110d3565b60008301525060206114af84828501611330565b60208301525060406114c38482850161142a565b60408301525060606114d784828501611456565b60608301525060806114eb848285016110d3565b60808301525060a06114ff848285016110d3565b60a08301525092915050565b600060c08284031215611521576115206110a8565b5b600061152f8482850161146b565b91505092915050565b60006040828403121561154e5761154d611372565b5b61155860406113e8565b90506000611568848285016110d3565b600083015250602061157c84828501611330565b60208301525092915050565b60006040828403121561159e5761159d6110a8565b5b60006115ac84828501611538565b91505092915050565b600082825260208201905092915050565b82818337600083830152505050565b60006115e183856115b5565b93506115ee8385846115c6565b6115f783611377565b840190509392505050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61163781611115565b82525050565b6000611649838361162e565b60208301905092915050565b6000602082019050919050565b600061166d82611602565b611677818561160d565b93506116828361161e565b8060005b838110156116b357815161169a888261163d565b97506116a583611655565b925050600181019050611686565b5085935050505092915050565b600060408201905081810360008301526116db8185876115d5565b905081810360208301526116ef8184611662565b9050949350505050565b60008115159050919050565b61170e816116f9565b811461171957600080fd5b50565b60008151905061172b81611705565b92915050565b600060208284031215611747576117466110a8565b5b60006117558482850161171c565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b611796816110b2565b82525050565b60006020820190506117b1600083018461178d565b92915050565b6117c0816112dd565b82525050565b6117cf81611403565b82525050565b6117de816110b2565b82525050565b6080820160008201516117fa60008501826117b7565b50602082015161180d60208501826117c6565b506040820151611820604085018261162e565b50606082015161183360608501826117d5565b50505050565b600060808201905061184e60008301846117e4565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061188e82611115565b915061189983611115565b92508282039050818111156118b1576118b0611854565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fd5b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600061191e83836117d5565b60208301905092915050565b6000602082019050919050565b6000611942826118e6565b61194c81856118f1565b935061195783611902565b8060005b8381101561198857815161196f8882611912565b975061197a8361192a565b92505060018101905061195b565b5085935050505092915050565b600060208201905081810360008301526119af8184611937565b905092915050565b6000819050919050565b6000819050919050565b60006119e66119e16119dc846119b7565b6119c1565b611115565b9050919050565b6119f6816119cb565b82525050565b600081519050919050565b60005b83811015611a25578082015181840152602081019050611a0a565b60008484015250505050565b6000611a3c826119fc565b611a4681856115b5565b9350611a56818560208601611a07565b611a5f81611377565b840191505092915050565b600060a082019050611a7f60008301886112ef565b611a8c60208301876119ed565b8181036040830152611a9e8186611a31565b9050611aad60608301856119ed565b611aba60808301846112ef565b9695505050505050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b608082016000820151611b0660008501826117b7565b506020820151611b1960208501826117c6565b506040820151611b2c604085018261162e565b506060820151611b3f60608501826117d5565b50505050565b6000611b518383611af0565b60808301905092915050565b6000602082019050919050565b6000611b7582611ac4565b611b7f8185611acf565b9350611b8a83611ae0565b8060005b83811015611bbb578151611ba28882611b45565b9750611bad83611b5d565b925050600181019050611b8e565b5085935050505092915050565b60006020820190508181036000830152611be28184611b6a565b905092915050565b6000819050919050565b611c05611c00826110b2565b611bea565b82525050565b60008160601b9050919050565b6000611c2382611c0b565b9050919050565b6000611c3582611c18565b9050919050565b611c4d611c48826112dd565b611c2a565b82525050565b6000611c5f8285611bf4565b602082019150611c6f8284611c3c565b6014820191508190509392505050565b6000611c8a82611115565b9150611c9583611115565b9250828202611ca381611115565b91508282048414831517611cba57611cb9611854565b5b5092915050565b60008160e01b9050919050565b6000611cd982611cc1565b9050919050565b611cf1611cec82611403565b611cce565b82525050565b6000819050919050565b611d12611d0d82611115565b611cf7565b82525050565b6000611d248287611c3c565b601482019150611d348286611ce0565b600482019150611d448285611d01565b602082019150611d548284611bf4565b60208201915081905095945050505050565b6000611d728289611bf4565b602082019150611d828288611c3c565b601482019150611d928287611ce0565b600482019150611da28286611d01565b602082019150611db28285611bf4565b602082019150611dc28284611bf4565b60208201915081905097965050505050505056fea2646970667358221220ff5b95ad06eec3a956be53c50f6c814a92035104528a0baba796f9406450ae2164736f6c63430008180033";

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
