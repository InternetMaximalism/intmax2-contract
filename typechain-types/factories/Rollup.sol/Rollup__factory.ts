/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Rollup, RollupInterface } from "../../Rollup.sol/Rollup";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "scrollMessenger",
        type: "address",
      },
      {
        internalType: "address",
        name: "liquidityContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stakeAmount",
        type: "uint256",
      },
    ],
    name: "BlockBuilderUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "prevBlockHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "blockBuilder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "blockContentHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "depositRoot",
        type: "bytes32",
      },
    ],
    name: "BlockPosted",
    type: "event",
  },
  {
    inputs: [],
    name: "CHALLENGE_DURATION",
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
    name: "MIN_STAKE_AMOUNT",
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
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "_blockBuilders",
    outputs: [
      {
        internalType: "string",
        name: "blockBuilderUrl",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "stakeAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastBlockTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_depositRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_liquidityContract",
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
    inputs: [],
    name: "_scrollMessenger",
    outputs: [
      {
        internalType: "contract IScrollMessenger",
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
        internalType: "uint32",
        name: "blockNumber",
        type: "uint32",
      },
    ],
    name: "getBlockHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "postBlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stopBlockBuilder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
    ],
    name: "updateBlockBuilder",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "depositRoot",
        type: "bytes32",
      },
    ],
    name: "updateDepositRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200165738038062001657833981810160405281019062000037919062000156565b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060046000801b908060018154018082558091505060019003906000526020600020016000909190919091505550506200019d565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200011e82620000f1565b9050919050565b620001308162000111565b81146200013c57600080fd5b50565b600081519050620001508162000125565b92915050565b6000806040838503121562000170576200016f620000ec565b5b600062000180858286016200013f565b925050602062000193858286016200013f565b9150509250929050565b6114aa80620001ad6000396000f3fe60806040526004361061009c5760003560e01c806367ab845b1161006457806367ab845b14610141578063aa8fc35b1461016c578063b9ebb1af14610197578063bdeab9d3146101c2578063c0a78a1e146101eb578063d2b210a11461022a5761009c565b8063045d9610146100a15780630f36c638146100cc57806327ed7188146100e85780635133485114610113578063551f595e1461012a575b600080fd5b3480156100ad57600080fd5b506100b6610267565b6040516100c39190610a01565b60405180910390f35b6100e660048036038101906100e19190610b76565b61028d565b005b3480156100f457600080fd5b506100fd610402565b60405161010a9190610bd8565b60405180910390f35b34801561011f57600080fd5b5061012861040a565b005b34801561013657600080fd5b5061013f610769565b005b34801561014d57600080fd5b506101566108a7565b6040516101639190610bd8565b60405180910390f35b34801561017857600080fd5b506101816108ac565b60405161018e9190610c52565b60405180910390f35b3480156101a357600080fd5b506101ac6108d0565b6040516101b99190610c86565b60405180910390f35b3480156101ce57600080fd5b506101e960048036038101906101e49190610ccd565b6108d6565b005b3480156101f757600080fd5b50610212600480360381019061020d9190610d26565b6108e0565b60405161022193929190610dd2565b60405180910390f35b34801561023657600080fd5b50610251600480360381019061024c9190610e4c565b610992565b60405161025e9190610c86565b60405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600034600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101546102dd9190610ea8565b90506305f5e100811015610326576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161031d90610f28565b60405180910390fd5b60405180606001604052808381526020018281526020016000815250600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000820151816000019081610396919061114a565b5060208201518160010155604082015181600201559050503373ffffffffffffffffffffffffffffffffffffffff167f2e6a62283ed761c959aaa67da7e98c90c08118cadc35aae3c7b9d0b258a5440583836040516103f692919061121c565b60405180910390a25050565b6305f5e10081565b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101540361048f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161048690611298565b60405180910390fd5b603c600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020154426104df91906112b8565b1015610520576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105179061135e565b60405180910390fd5b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001805461056f90610f77565b80601f016020809104026020016040519081016040528092919081815260200182805461059b90610f77565b80156105e85780601f106105bd576101008083540402835291602001916105e8565b820191906000526020600020905b8154815290600101906020018083116105cb57829003601f168201915b505050505090506000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206001015490506040518060600160405280604051806020016040528060008152508152602001600081526020016000815250600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008201518160000190816106b6919061114a565b5060208201518160010155604082015181600201559050503373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050158015610714573d6000803e3d6000fd5b503373ffffffffffffffffffffffffffffffffffffffff167f2e6a62283ed761c959aaa67da7e98c90c08118cadc35aae3c7b9d0b258a54405838360405161075d92919061121c565b60405180910390a25050565b42600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206002018190555060006004805490509050600060046001836107cb91906112b8565b815481106107dc576107db61137e565b5b9060005260206000200154905060008060001b905060008060001b905060048385848460405160200161081294939291906113ef565b6040516020818303038152906040528051906020012090806001815401808255809150506001900390600052602060002001600090919091909150553373ffffffffffffffffffffffffffffffffffffffff16837fe27163b76905dc373b4ad854ddc9403bbac659c5f1c5191c39e5a7c44574040a8685856040516108999392919061143d565b60405180910390a350505050565b603c81565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60035481565b8060038190555050565b600260205280600052604060002060009150905080600001805461090390610f77565b80601f016020809104026020016040519081016040528092919081815260200182805461092f90610f77565b801561097c5780601f106109515761010080835404028352916020019161097c565b820191906000526020600020905b81548152906001019060200180831161095f57829003601f168201915b5050505050908060010154908060020154905083565b600060048263ffffffff16815481106109ae576109ad61137e565b5b90600052602060002001549050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006109eb826109c0565b9050919050565b6109fb816109e0565b82525050565b6000602082019050610a1660008301846109f2565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610a8382610a3a565b810181811067ffffffffffffffff82111715610aa257610aa1610a4b565b5b80604052505050565b6000610ab5610a1c565b9050610ac18282610a7a565b919050565b600067ffffffffffffffff821115610ae157610ae0610a4b565b5b610aea82610a3a565b9050602081019050919050565b82818337600083830152505050565b6000610b19610b1484610ac6565b610aab565b905082815260208101848484011115610b3557610b34610a35565b5b610b40848285610af7565b509392505050565b600082601f830112610b5d57610b5c610a30565b5b8135610b6d848260208601610b06565b91505092915050565b600060208284031215610b8c57610b8b610a26565b5b600082013567ffffffffffffffff811115610baa57610ba9610a2b565b5b610bb684828501610b48565b91505092915050565b6000819050919050565b610bd281610bbf565b82525050565b6000602082019050610bed6000830184610bc9565b92915050565b6000819050919050565b6000610c18610c13610c0e846109c0565b610bf3565b6109c0565b9050919050565b6000610c2a82610bfd565b9050919050565b6000610c3c82610c1f565b9050919050565b610c4c81610c31565b82525050565b6000602082019050610c676000830184610c43565b92915050565b6000819050919050565b610c8081610c6d565b82525050565b6000602082019050610c9b6000830184610c77565b92915050565b610caa81610c6d565b8114610cb557600080fd5b50565b600081359050610cc781610ca1565b92915050565b600060208284031215610ce357610ce2610a26565b5b6000610cf184828501610cb8565b91505092915050565b610d03816109e0565b8114610d0e57600080fd5b50565b600081359050610d2081610cfa565b92915050565b600060208284031215610d3c57610d3b610a26565b5b6000610d4a84828501610d11565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d8d578082015181840152602081019050610d72565b60008484015250505050565b6000610da482610d53565b610dae8185610d5e565b9350610dbe818560208601610d6f565b610dc781610a3a565b840191505092915050565b60006060820190508181036000830152610dec8186610d99565b9050610dfb6020830185610bc9565b610e086040830184610bc9565b949350505050565b600063ffffffff82169050919050565b610e2981610e10565b8114610e3457600080fd5b50565b600081359050610e4681610e20565b92915050565b600060208284031215610e6257610e61610a26565b5b6000610e7084828501610e37565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610eb382610bbf565b9150610ebe83610bbf565b9250828201905080821115610ed657610ed5610e79565b5b92915050565b7f496e73756666696369656e74207374616b6520616d6f756e7400000000000000600082015250565b6000610f12601983610d5e565b9150610f1d82610edc565b602082019050919050565b60006020820190508181036000830152610f4181610f05565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610f8f57607f821691505b602082108103610fa257610fa1610f48565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b60006008830261100a7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610fcd565b6110148683610fcd565b95508019841693508086168417925050509392505050565b600061104761104261103d84610bbf565b610bf3565b610bbf565b9050919050565b6000819050919050565b6110618361102c565b61107561106d8261104e565b848454610fda565b825550505050565b600090565b61108a61107d565b611095818484611058565b505050565b5b818110156110b9576110ae600082611082565b60018101905061109b565b5050565b601f8211156110fe576110cf81610fa8565b6110d884610fbd565b810160208510156110e7578190505b6110fb6110f385610fbd565b83018261109a565b50505b505050565b600082821c905092915050565b600061112160001984600802611103565b1980831691505092915050565b600061113a8383611110565b9150826002028217905092915050565b61115382610d53565b67ffffffffffffffff81111561116c5761116b610a4b565b5b6111768254610f77565b6111818282856110bd565b600060209050601f8311600181146111b457600084156111a2578287015190505b6111ac858261112e565b865550611214565b601f1984166111c286610fa8565b60005b828110156111ea578489015182556001820191506020850194506020810190506111c5565b868310156112075784890151611203601f891682611110565b8355505b6001600288020188555050505b505050505050565b600060408201905081810360008301526112368185610d99565b90506112456020830184610bc9565b9392505050565b7f426c6f636b206275696c646572206e6f7420666f756e64000000000000000000600082015250565b6000611282601783610d5e565b915061128d8261124c565b602082019050919050565b600060208201905081810360008301526112b181611275565b9050919050565b60006112c382610bbf565b91506112ce83610bbf565b92508282039050818111156112e6576112e5610e79565b5b92915050565b7f43616e6e6f7420756e7374616b652077697468696e206f6e6520646179206f6660008201527f20746865206c61737420626c6f636b207375626d697373696f6e000000000000602082015250565b6000611348603a83610d5e565b9150611353826112ec565b604082019050919050565b600060208201905081810360008301526113778161133b565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000819050919050565b6113c86113c382610c6d565b6113ad565b82525050565b6000819050919050565b6113e96113e482610bbf565b6113ce565b82525050565b60006113fb82876113b7565b60208201915061140b82866113d8565b60208201915061141b82856113b7565b60208201915061142b82846113b7565b60208201915081905095945050505050565b60006060820190506114526000830186610bc9565b61145f6020830185610c77565b61146c6040830184610c77565b94935050505056fea2646970667358221220d0e4044ade869a533ab05666ccc3936e1fd08872c21fa98c62d988498940a59164736f6c63430008140033";

type RollupConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RollupConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Rollup__factory extends ContractFactory {
  constructor(...args: RollupConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    scrollMessenger: PromiseOrValue<string>,
    liquidityContract: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Rollup> {
    return super.deploy(
      scrollMessenger,
      liquidityContract,
      overrides || {}
    ) as Promise<Rollup>;
  }
  override getDeployTransaction(
    scrollMessenger: PromiseOrValue<string>,
    liquidityContract: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      scrollMessenger,
      liquidityContract,
      overrides || {}
    );
  }
  override attach(address: string): Rollup {
    return super.attach(address) as Rollup;
  }
  override connect(signer: Signer): Rollup__factory {
    return super.connect(signer) as Rollup__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RollupInterface {
    return new utils.Interface(_abi) as RollupInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Rollup {
    return new Contract(address, _abi, signerOrProvider) as Rollup;
  }
}
