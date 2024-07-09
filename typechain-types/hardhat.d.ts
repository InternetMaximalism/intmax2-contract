/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  DeployContractOptions,
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomicfoundation/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "IERC1155Errors",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155Errors__factory>;
    getContractFactory(
      name: "IERC20Errors",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Errors__factory>;
    getContractFactory(
      name: "IERC721Errors",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Errors__factory>;
    getContractFactory(
      name: "IERC1155",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155__factory>;
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Metadata__factory>;
    getContractFactory(
      name: "IERC20Permit",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Permit__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "SafeERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SafeERC20__factory>;
    getContractFactory(
      name: "IERC721",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721__factory>;
    getContractFactory(
      name: "Address",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Address__factory>;
    getContractFactory(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165__factory>;
    getContractFactory(
      name: "ReentrancyGuard",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ReentrancyGuard__factory>;
    getContractFactory(
      name: "IL1GasPriceOracle",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IL1GasPriceOracle__factory>;
    getContractFactory(
      name: "IScrollMessenger",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IScrollMessenger__factory>;
    getContractFactory(
      name: "BlockBuilderRegistry",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.BlockBuilderRegistry__factory>;
    getContractFactory(
      name: "IBlockBuilderRegistry",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBlockBuilderRegistry__factory>;
    getContractFactory(
      name: "ILiquidity",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ILiquidity__factory>;
    getContractFactory(
      name: "IPlonkVerifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPlonkVerifier__factory>;
    getContractFactory(
      name: "IRollup",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IRollup__factory>;
    getContractFactory(
      name: "MockPlonkVerifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.MockPlonkVerifier__factory>;
    getContractFactory(
      name: "Liquidity",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Liquidity__factory>;
    getContractFactory(
      name: "MockL1GasPriceOracle",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.MockL1GasPriceOracle__factory>;
    getContractFactory(
      name: "Rollup",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Rollup__factory>;
    getContractFactory(
      name: "TestERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TestERC20__factory>;

    getContractAt(
      name: "IERC1155Errors",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155Errors>;
    getContractAt(
      name: "IERC20Errors",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Errors>;
    getContractAt(
      name: "IERC721Errors",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Errors>;
    getContractAt(
      name: "IERC1155",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155>;
    getContractAt(
      name: "ERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "IERC20Metadata",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Metadata>;
    getContractAt(
      name: "IERC20Permit",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Permit>;
    getContractAt(
      name: "IERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "SafeERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.SafeERC20>;
    getContractAt(
      name: "IERC721",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721>;
    getContractAt(
      name: "Address",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Address>;
    getContractAt(
      name: "IERC165",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165>;
    getContractAt(
      name: "ReentrancyGuard",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ReentrancyGuard>;
    getContractAt(
      name: "IL1GasPriceOracle",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IL1GasPriceOracle>;
    getContractAt(
      name: "IScrollMessenger",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IScrollMessenger>;
    getContractAt(
      name: "BlockBuilderRegistry",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.BlockBuilderRegistry>;
    getContractAt(
      name: "IBlockBuilderRegistry",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IBlockBuilderRegistry>;
    getContractAt(
      name: "ILiquidity",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ILiquidity>;
    getContractAt(
      name: "IPlonkVerifier",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IPlonkVerifier>;
    getContractAt(
      name: "IRollup",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IRollup>;
    getContractAt(
      name: "MockPlonkVerifier",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.MockPlonkVerifier>;
    getContractAt(
      name: "Liquidity",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Liquidity>;
    getContractAt(
      name: "MockL1GasPriceOracle",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.MockL1GasPriceOracle>;
    getContractAt(
      name: "Rollup",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Rollup>;
    getContractAt(
      name: "TestERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.TestERC20>;

    deployContract(
      name: "IERC1155Errors",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1155Errors>;
    deployContract(
      name: "IERC20Errors",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Errors>;
    deployContract(
      name: "IERC721Errors",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC721Errors>;
    deployContract(
      name: "IERC1155",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1155>;
    deployContract(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20>;
    deployContract(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Metadata>;
    deployContract(
      name: "IERC20Permit",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Permit>;
    deployContract(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20>;
    deployContract(
      name: "SafeERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.SafeERC20>;
    deployContract(
      name: "IERC721",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC721>;
    deployContract(
      name: "Address",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Address>;
    deployContract(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC165>;
    deployContract(
      name: "ReentrancyGuard",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ReentrancyGuard>;
    deployContract(
      name: "IL1GasPriceOracle",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IL1GasPriceOracle>;
    deployContract(
      name: "IScrollMessenger",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IScrollMessenger>;
    deployContract(
      name: "BlockBuilderRegistry",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.BlockBuilderRegistry>;
    deployContract(
      name: "IBlockBuilderRegistry",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBlockBuilderRegistry>;
    deployContract(
      name: "ILiquidity",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ILiquidity>;
    deployContract(
      name: "IPlonkVerifier",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IPlonkVerifier>;
    deployContract(
      name: "IRollup",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IRollup>;
    deployContract(
      name: "MockPlonkVerifier",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.MockPlonkVerifier>;
    deployContract(
      name: "Liquidity",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Liquidity>;
    deployContract(
      name: "MockL1GasPriceOracle",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.MockL1GasPriceOracle>;
    deployContract(
      name: "Rollup",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Rollup>;
    deployContract(
      name: "TestERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.TestERC20>;

    deployContract(
      name: "IERC1155Errors",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1155Errors>;
    deployContract(
      name: "IERC20Errors",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Errors>;
    deployContract(
      name: "IERC721Errors",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC721Errors>;
    deployContract(
      name: "IERC1155",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1155>;
    deployContract(
      name: "ERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20>;
    deployContract(
      name: "IERC20Metadata",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Metadata>;
    deployContract(
      name: "IERC20Permit",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Permit>;
    deployContract(
      name: "IERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20>;
    deployContract(
      name: "SafeERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.SafeERC20>;
    deployContract(
      name: "IERC721",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC721>;
    deployContract(
      name: "Address",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Address>;
    deployContract(
      name: "IERC165",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC165>;
    deployContract(
      name: "ReentrancyGuard",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ReentrancyGuard>;
    deployContract(
      name: "IL1GasPriceOracle",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IL1GasPriceOracle>;
    deployContract(
      name: "IScrollMessenger",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IScrollMessenger>;
    deployContract(
      name: "BlockBuilderRegistry",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.BlockBuilderRegistry>;
    deployContract(
      name: "IBlockBuilderRegistry",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBlockBuilderRegistry>;
    deployContract(
      name: "ILiquidity",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ILiquidity>;
    deployContract(
      name: "IPlonkVerifier",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IPlonkVerifier>;
    deployContract(
      name: "IRollup",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IRollup>;
    deployContract(
      name: "MockPlonkVerifier",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.MockPlonkVerifier>;
    deployContract(
      name: "Liquidity",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Liquidity>;
    deployContract(
      name: "MockL1GasPriceOracle",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.MockL1GasPriceOracle>;
    deployContract(
      name: "Rollup",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Rollup>;
    deployContract(
      name: "TestERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.TestERC20>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
  }
}
