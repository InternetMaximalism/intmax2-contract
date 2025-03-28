/**
 * INTMAX2 Contract Package
 * 
 * This package provides Solidity contracts for the INTMAX2 protocol.
 * It can be used in both JavaScript/TypeScript projects and Foundry projects.
 */

// Export contract names for convenience
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
