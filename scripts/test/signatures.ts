import { ethers } from 'hardhat';
import { expect } from 'chai'
import { parseEther, encodeFunctionData } from 'viem';
import { getRandomPubkey, getRandomSalt } from '../utils/rand';
import { getPubkeySaltHash } from '../utils/hash';

const depositNativeTokenAbi = {
  name: 'depositNativeToken',
  type: 'function',
  stateMutability: 'payable',
  inputs: [
    {
      name: 'recipientSaltHash',
      type: 'bytes32'
    }
  ],
  outputs: [],
};

const depositERC20Abi = {
  name: 'depositERC20',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    {
      name: 'tokenAddress',
      type: 'address'
    },
    {
      name: 'recipientSaltHash',
      type: 'bytes32'
    },
    {
      name: 'amount',
      type: 'uint256'
    }
  ],
  outputs: [],
};

const depositERC721Abi = {
  name: 'depositERC721',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    {
      name: 'tokenAddress',
      type: 'address'
    },
    {
      name: 'recipientSaltHash',
      type: 'bytes32'
    },
    {
      name: 'tokenId',
      type: 'uint256'
    }
  ],
  outputs: [],
};

const depositERC1155Abi = {
  name: 'depositERC1155',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    {
      name: 'tokenAddress',
      type: 'address'
    },
    {
      name: 'recipientSaltHash',
      type: 'bytes32'
    },
    {
      name: 'tokenId',
      type: 'uint256'
    },
    {
      name: 'amount',
      type: 'uint256'
    }
  ],
  outputs: [],
};

async function main() {
  const pubkey = getRandomPubkey(); // intmax address of user
  const salt = getRandomSalt(); // random salt
  const recipientSaltHash = getPubkeySaltHash(pubkey, salt);
  const tokenAddress = '0x1234567890123456789012345678901234567890';
  const tokenId = 123n;
  const amount = parseEther('0.000000001');

  const encodedDepositNativeToken = encodeFunctionData({
    abi: [depositNativeTokenAbi],
    functionName: 'depositNativeToken',
    args: [recipientSaltHash]
  });
  console.log('Encoded depositNativeToken:', encodedDepositNativeToken);

  const encodedDepositERC20 = encodeFunctionData({
    abi: [depositERC20Abi],
    functionName: 'depositERC20',
    args: [tokenAddress, recipientSaltHash, amount]
  });
  console.log('Encoded depositERC20:', encodedDepositERC20);

  const encodedDepositERC721 = encodeFunctionData({
    abi: [depositERC721Abi],
    functionName: 'depositERC721',
    args: [tokenAddress, recipientSaltHash, tokenId]
  });
  console.log('Encoded depositERC721:', encodedDepositERC721);

  const encodedDepositERC1155 = encodeFunctionData({
    abi: [depositERC1155Abi],
    functionName: 'depositERC1155',
    args: [tokenAddress, recipientSaltHash, tokenId, amount]
  });
  console.log('Encoded depositERC1155:', encodedDepositERC1155);

  const EncodedArgsContract = await ethers.getContractFactory('EncodedArgs');
  const encodedArgsContract = await EncodedArgsContract.deploy();

  const depositDataNative = await encodedArgsContract.depositNativeToken(recipientSaltHash);
  expect(depositDataNative).to.equal(encodedDepositNativeToken);

  const depositDataERC20 = await encodedArgsContract.depositERC20(tokenAddress, recipientSaltHash, amount);
  expect(depositDataERC20).to.equal(encodedDepositERC20);

  const depositDataERC721 = await encodedArgsContract.depositERC721(tokenAddress, recipientSaltHash, tokenId);
  expect(depositDataERC721).to.equal(encodedDepositERC721);

  const depositDataERC1155 = await encodedArgsContract.depositERC1155(tokenAddress, recipientSaltHash, tokenId, amount);
  expect(depositDataERC1155).to.equal(encodedDepositERC1155);
}

main().catch(console.error);
