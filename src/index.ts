// Export contract artifacts
import { artifacts } from 'hardhat';

// Export contract interfaces from typechain-types
import * as TypechainTypes from '../typechain-types';
export { TypechainTypes };

// Export contract artifacts
export const getContractArtifact = async (contractName: string) => {
  return await artifacts.readArtifact(contractName);
};

// Export contract ABIs
export const getContractABI = async (contractName: string) => {
  const artifact = await getContractArtifact(contractName);
  return artifact.abi;
};

// Export contract bytecode
export const getContractBytecode = async (contractName: string) => {
  const artifact = await getContractArtifact(contractName);
  return artifact.bytecode;
};

// Export main contract names for convenience
export const ContractNames = {
  // Block Builder Registry
  BlockBuilderRegistry: 'BlockBuilderRegistry',
  IBlockBuilderRegistry: 'IBlockBuilderRegistry',
  
  // Claim
  Claim: 'Claim',
  IClaim: 'IClaim',
  
  // Common
  Byte32Lib: 'Byte32Lib',
  DepositLib: 'DepositLib',
  IPlonkVerifier: 'IPlonkVerifier',
  WithdrawalLib: 'WithdrawalLib',
  
  // Contribution
  Contribution: 'Contribution',
  IContribution: 'IContribution',
  
  // Liquidity
  ILiquidity: 'ILiquidity',
  ITokenData: 'ITokenData',
  Liquidity: 'Liquidity',
  TokenData: 'TokenData',
  
  // Permitter
  IPermitter: 'IPermitter',
  PredicatePermitter: 'PredicatePermitter',
  
  // Rollup
  IRollup: 'IRollup',
  Rollup: 'Rollup',
  
  // Verifiers
  ClaimPlonkVerifier: 'ClaimPlonkVerifier',
  WithdrawalPlonkVerifier: 'WithdrawalPlonkVerifier',
  
  // Withdrawal
  IWithdrawal: 'IWithdrawal',
  Withdrawal: 'Withdrawal',
};

// Export libraries
export const LibraryNames = {
  // Claim libraries
  AllocationLib: 'AllocationLib',
  ChainedClaimLib: 'ChainedClaimLib',
  ClaimProofPublicInputsLib: 'ClaimProofPublicInputsLib',
  
  // Liquidity libraries
  DepositLimit: 'DepositLimit',
  DepositQueueLib: 'DepositQueueLib',
  ERC20CallOptionalLib: 'ERC20CallOptionalLib',
  
  // Rollup libraries
  BlockHashLib: 'BlockHashLib',
  DepositTreeLib: 'DepositTreeLib',
  PairingLib: 'PairingLib',
  RateLimiterLib: 'RateLimiterLib',
  
  // Withdrawal libraries
  ChainedWithdrawalLib: 'ChainedWithdrawalLib',
  WithdrawalProofPublicInputsLib: 'WithdrawalProofPublicInputsLib',
};

// Export utility functions from scripts/utils
import * as ClaimInfo from '../scripts/utils/types/claimInfo';
import * as FullBlock from '../scripts/utils/types/fullBlock';
import * as PairingData from '../scripts/utils/types/pairing_data';
import * as WithdrawalInfo from '../scripts/utils/types/withdrawalInfo';
import * as Hash from '../scripts/utils/hash';
import * as Rand from '../scripts/utils/rand';
import * as RollupUtils from '../scripts/utils/rollup';
import * as Events from '../scripts/utils/events';
import * as WithdrawalUtils from '../scripts/utils/withdrawal';
import * as Conversion from '../scripts/utils/conversion';
import * as ClaimUtils from '../scripts/utils/claim';

// Export utility functions as namespaces to avoid name conflicts
export const Utils = {
  ClaimInfo,
  FullBlock,
  PairingData,
  WithdrawalInfo,
  Hash,
  Rand,
  Rollup: RollupUtils,
  Events,
  Withdrawal: WithdrawalUtils,
  Conversion,
  Claim: ClaimUtils,
};
