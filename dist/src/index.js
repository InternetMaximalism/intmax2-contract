"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.LibraryNames = exports.ContractNames = exports.getContractBytecode = exports.getContractABI = exports.getContractArtifact = exports.TypechainTypes = void 0;
// Export contract artifacts
const hardhat_1 = require("hardhat");
// Export contract interfaces from typechain-types
const TypechainTypes = __importStar(require("../typechain-types"));
exports.TypechainTypes = TypechainTypes;
// Export contract artifacts
const getContractArtifact = async (contractName) => {
    return await hardhat_1.artifacts.readArtifact(contractName);
};
exports.getContractArtifact = getContractArtifact;
// Export contract ABIs
const getContractABI = async (contractName) => {
    const artifact = await (0, exports.getContractArtifact)(contractName);
    return artifact.abi;
};
exports.getContractABI = getContractABI;
// Export contract bytecode
const getContractBytecode = async (contractName) => {
    const artifact = await (0, exports.getContractArtifact)(contractName);
    return artifact.bytecode;
};
exports.getContractBytecode = getContractBytecode;
// Export main contract names for convenience
exports.ContractNames = {
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
exports.LibraryNames = {
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
const ClaimInfo = __importStar(require("../scripts/utils/types/claimInfo"));
const FullBlock = __importStar(require("../scripts/utils/types/fullBlock"));
const PairingData = __importStar(require("../scripts/utils/types/pairing_data"));
const WithdrawalInfo = __importStar(require("../scripts/utils/types/withdrawalInfo"));
const Hash = __importStar(require("../scripts/utils/hash"));
const Rand = __importStar(require("../scripts/utils/rand"));
const RollupUtils = __importStar(require("../scripts/utils/rollup"));
const Events = __importStar(require("../scripts/utils/events"));
const WithdrawalUtils = __importStar(require("../scripts/utils/withdrawal"));
const Conversion = __importStar(require("../scripts/utils/conversion"));
const ClaimUtils = __importStar(require("../scripts/utils/claim"));
// Export utility functions as namespaces to avoid name conflicts
exports.Utils = {
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
