# Solidity API

## Claim

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _scrollMessenger, address _claimVerifier, address _liquidity, address _rollup, address _contribution, uint256 periodInterval) external
```

### submitClaimProof

```solidity
function submitClaimProof(struct ChainedClaimLib.ChainedClaim[] claims, struct ClaimProofPublicInputsLib.ClaimProofPublicInputs publicInputs, bytes proof) external
```

Submit claim proof from intmax2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| claims | struct ChainedClaimLib.ChainedClaim[] | List of chained claims |
| publicInputs | struct ClaimProofPublicInputsLib.ClaimProofPublicInputs | Public inputs for the claim proof |
| proof | bytes | The proof data |

### relayClaims

```solidity
function relayClaims(uint256 period, address[] users) external
```

relay claims to the liquidity contract as withdrawals

### getCurrentPeriod

```solidity
function getCurrentPeriod() external view returns (uint256)
```

Get the current period number

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current period number |

### getAllocationInfo

```solidity
function getAllocationInfo(uint256 periodNumber, address user) external view returns (struct AllocationLib.AllocationInfo)
```

Get the allocation info for a user in a period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| periodNumber | uint256 | The period number |
| user | address | The user address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AllocationLib.AllocationInfo | The allocation info |

### getAllocationConstants

```solidity
function getAllocationConstants() external view returns (struct AllocationLib.AllocationConstants)
```

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AllocationLib.AllocationConstants | The allocation constants |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

## IClaim

### AddressZero

```solidity
error AddressZero()
```

address is zero address

### ClaimChainVerificationFailed

```solidity
error ClaimChainVerificationFailed()
```

Error thrown when the verification of the claim proof's public input hash chain fails

### ClaimAggregatorMismatch

```solidity
error ClaimAggregatorMismatch()
```

Error thrown when the aggregator in the claim proof's public input doesn't match the actual contract executor

### BlockHashNotExists

```solidity
error BlockHashNotExists(bytes32 blockHash)
```

Error thrown when the block hash in the claim proof's public input doesn't exist

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockHash | bytes32 | The non-existent block hash |

### ClaimProofVerificationFailed

```solidity
error ClaimProofVerificationFailed()
```

Error thrown when the ZKP verification of the claim proof fails

### DirectWithdrawalQueued

```solidity
event DirectWithdrawalQueued(bytes32 withdrawalHash, address recipient, struct WithdrawalLib.Withdrawal withdrawal)
```

Emitted when a direct withdrawal is queued

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawalHash | bytes32 | The hash of the withdrawal |
| recipient | address | The address of the recipient |
| withdrawal | struct WithdrawalLib.Withdrawal | The withdrawal details |

### submitClaimProof

```solidity
function submitClaimProof(struct ChainedClaimLib.ChainedClaim[] claims, struct ClaimProofPublicInputsLib.ClaimProofPublicInputs publicInputs, bytes proof) external
```

Submit claim proof from intmax2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| claims | struct ChainedClaimLib.ChainedClaim[] | List of chained claims |
| publicInputs | struct ClaimProofPublicInputsLib.ClaimProofPublicInputs | Public inputs for the claim proof |
| proof | bytes | The proof data |

### relayClaims

```solidity
function relayClaims(uint256 period, address[] users) external
```

relay claims to the liquidity contract as withdrawals

### getCurrentPeriod

```solidity
function getCurrentPeriod() external view returns (uint256)
```

Get the current period number

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current period number |

### getAllocationInfo

```solidity
function getAllocationInfo(uint256 periodNumber, address user) external view returns (struct AllocationLib.AllocationInfo)
```

Get the allocation info for a user in a period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| periodNumber | uint256 | The period number |
| user | address | The user address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AllocationLib.AllocationInfo | The allocation info |

### getAllocationConstants

```solidity
function getAllocationConstants() external view returns (struct AllocationLib.AllocationConstants)
```

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AllocationLib.AllocationConstants | The allocation constants |

## AllocationLib

### GENESIS_TIMESTAMP

```solidity
uint256 GENESIS_TIMESTAMP
```

### PHASE0_REWARD_PER_DAY

```solidity
uint256 PHASE0_REWARD_PER_DAY
```

### NUM_PHASES

```solidity
uint256 NUM_PHASES
```

### PHASE0_PERIOD

```solidity
uint256 PHASE0_PERIOD
```

### InvalidDepositAmount

```solidity
error InvalidDepositAmount()
```

Emitted when an invalid deposit amount is provided

### NotFinishedPeriod

```solidity
error NotFinishedPeriod()
```

Emitted when an attempt is made to consume allocations for the current period

### periodIntervalZero

```solidity
error periodIntervalZero()
```

Emitted when the period interval is zero

### ContributionRecorded

```solidity
event ContributionRecorded(uint256 period, address recipient, uint256 depositAmount, uint256 contribution)
```

Emitted when a contribution is recorded

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| period | uint256 | current period |
| recipient | address | user address |
| depositAmount | uint256 | deposit amount |
| contribution | uint256 | calculated contribution |

### State

Represents the state of the allocation

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct State {
  uint256 startTimestamp;
  uint256 periodInterval;
  mapping(uint256 => uint256) totalContributions;
  mapping(uint256 => mapping(address => uint256)) userContributions;
}
```

### AllocationConstants

Represents the constants for the allocation

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct AllocationConstants {
  uint256 startTimestamp;
  uint256 periodInterval;
  uint256 genesisTimestamp;
  uint256 phase0RewardPerDay;
  uint256 numPhases;
  uint256 phase0Period;
}
```

### AllocationInfo

Represents the information for a user's allocation

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct AllocationInfo {
  uint256 totalContribution;
  uint256 allocationPerPeriod;
  uint256 userContribution;
  uint256 userAllocation;
}
```

### initialize

```solidity
function initialize(struct AllocationLib.State state, uint256 periodInterval) internal
```

Initializes the allocation state

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |
| periodInterval | uint256 |  |

### recordContribution

```solidity
function recordContribution(struct AllocationLib.State state, address recipient, uint256 depositAmount) internal
```

Records a user's contribution

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |
| recipient | address | The address of the recipient |
| depositAmount | uint256 | The amount of the deposit |

### getUserAllocation

```solidity
function getUserAllocation(struct AllocationLib.State state, uint256 periodNumber, address user) internal view returns (uint256)
```

Gets the user's allocation for a period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |
| periodNumber | uint256 | The period number |
| user | address | The user's address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The user's allocation |

### consumeUserAllocation

```solidity
function consumeUserAllocation(struct AllocationLib.State state, uint256 periodNumber, address user) internal returns (uint256)
```

Consumes a user's allocation for a period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |
| periodNumber | uint256 | The period number |
| user | address | The user's address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The user's allocation |

### getAllocationPerPeriod

```solidity
function getAllocationPerPeriod(struct AllocationLib.State state, uint256 periodNumber) internal view returns (uint256)
```

Gets the allocation per period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |
| periodNumber | uint256 | The period number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The allocation per period |

### calculateContribution

```solidity
function calculateContribution(uint256 amount) internal pure returns (uint256)
```

Calculates the contribution for a deposit amount

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The deposit amount |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The calculated contribution |

### getCurrentPeriod

```solidity
function getCurrentPeriod(struct AllocationLib.State state) internal view returns (uint256)
```

Gets the current period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current period |

### getAllocationInfo

```solidity
function getAllocationInfo(struct AllocationLib.State state, uint256 periodNumber, address user) internal view returns (struct AllocationLib.AllocationInfo)
```

Gets the allocation information for a user

_This function is not called by the contract,
so gas optimization is not necessary_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |
| periodNumber | uint256 | The period number |
| user | address | The user's address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AllocationLib.AllocationInfo | The allocation information |

### getAllocationConstants

```solidity
function getAllocationConstants(struct AllocationLib.State state) internal view returns (struct AllocationLib.AllocationConstants)
```

Gets the allocation constants

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct AllocationLib.State | The allocation state |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AllocationLib.AllocationConstants | The allocation constants |

## ChainedClaimLib

Library for handling chained claims in a hash chain

### ChainedClaim

Represents a claim linked in a hash chain, used in claim proof public inputs

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct ChainedClaim {
  address recipient;
  uint256 amount;
  bytes32 nullifier;
  bytes32 blockHash;
  uint32 blockNumber;
}
```

### verifyClaimChain

```solidity
function verifyClaimChain(struct ChainedClaimLib.ChainedClaim[] claims, bytes32 lastClaimHash) internal pure returns (bool)
```

Verifies the integrity of a claim hash chain

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| claims | struct ChainedClaimLib.ChainedClaim[] | Array of ChainedClaims to verify |
| lastClaimHash | bytes32 | The expected hash of the last claim in the chain |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool True if the chain is valid, false otherwise |

## ClaimProofPublicInputsLib

### ClaimProofPublicInputs

Represents the public inputs for a claim proof

```solidity
struct ClaimProofPublicInputs {
  bytes32 lastClaimHash;
  address claimAggregator;
}
```

### getHash

```solidity
function getHash(struct ClaimProofPublicInputsLib.ClaimProofPublicInputs inputs) internal pure returns (bytes32)
```

Computes the hash of the ClaimProofPublicInputs

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| inputs | struct ClaimProofPublicInputsLib.ClaimProofPublicInputs | The ClaimProofPublicInputs to be hashed |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | bytes32 The resulting hash |

## Byte32Lib

### split

```solidity
function split(bytes32 input) internal pure returns (uint256[])
```

Splits a bytes32 into an array of uint256, each representing 4 bytes

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| input | bytes32 | The bytes32 value to be split |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of 8 uint256 values, each representing 4 bytes of the input |

## DepositLib

### Deposit

This struct is used to represent a deposit in the Deposit tree

_Represents a leaf in the Deposit tree_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct Deposit {
  address depositor;
  bytes32 recipientSaltHash;
  uint256 amount;
  uint32 tokenIndex;
  bool isEligible;
}
```

### getHash

```solidity
function getHash(struct DepositLib.Deposit deposit) internal pure returns (bytes32)
```

Calculates the hash of a Deposit struct

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| deposit | struct DepositLib.Deposit | The Deposit struct to be hashed |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | bytes32 The calculated hash of the Deposit |

## IPlonkVerifier

### Verify

```solidity
function Verify(bytes proof, uint256[] publicInputs) external view returns (bool success)
```

Verify a Plonk proof.
Reverts if the proof or the public inputs are malformed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proof | bytes | serialised plonk proof (using gnark's MarshalSolidity) |
| publicInputs | uint256[] | (must be reduced) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| success | bool | true if the proof passes false otherwise |

## WithdrawalLib

### Withdrawal

This struct is used to represent a withdrawal operation

_Represents the information for a withdrawal operation_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct Withdrawal {
  address recipient;
  uint32 tokenIndex;
  uint256 amount;
  bytes32 nullifier;
}
```

### getHash

```solidity
function getHash(struct WithdrawalLib.Withdrawal withdrawal) internal pure returns (bytes32)
```

Calculates the hash of a Withdrawal struct

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawal | struct WithdrawalLib.Withdrawal | The Withdrawal struct to be hashed |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | bytes32 The calculated hash of the Withdrawal |

## IContribution

### periodIntervalZero

```solidity
error periodIntervalZero()
```

Emitted when the period interval is zero

### ContributionRecorded

```solidity
event ContributionRecorded(uint256 periodNumber, bytes32 tag, address user, uint256 amount)
```

Emitted when a contribution is recorded.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| periodNumber | uint256 | The number of the period. |
| tag | bytes32 | The tag associated with the contribution. |
| user | address | The address of the user making the contribution. |
| amount | uint256 | The amount of the contribution. |

### getCurrentPeriod

```solidity
function getCurrentPeriod() external view returns (uint256)
```

Gets the current period

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current period |

### recordContribution

```solidity
function recordContribution(bytes32 tag, address user, uint256 amount) external
```

Record a contribution for a specific tag and user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tag | bytes32 | The tag associated with the contribution. |
| user | address | The address of the user making the contribution. |
| amount | uint256 | The amount of contribution to record. |

### totalContributions

```solidity
function totalContributions(uint256 period, bytes32 tag) external view returns (uint256)
```

Returns the total contribution for a specific tag in the specified period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| period | uint256 | The period for which the contribution is being queried |
| tag | bytes32 | The tag (as bytes32) for which the contribution is being queried |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The unweighted total contribution amount as a uint256 |

### userContributions

```solidity
function userContributions(uint256 period, bytes32 tag, address user) external view returns (uint256)
```

Returns the current contribution of a user for a specific tag in the specified period

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| period | uint256 | The period for which the contribution is being queried |
| tag | bytes32 | The tag (as bytes32) for which the contribution is being queried |
| user | address | The address of the user whose contribution is being queried |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The unweighted contribution amount as a uint256 |

## ILiquidity

### AddressZero

```solidity
error AddressZero()
```

address is zero address

### OnlySenderCanCancelDeposit

```solidity
error OnlySenderCanCancelDeposit()
```

Error thrown when someone other than the original depositor tries to cancel a deposit

### InvalidDepositHash

```solidity
error InvalidDepositHash(bytes32 depositDataHash, bytes32 calculatedHash)
```

Error thrown when the provided deposit hash doesn't match the calculated hash during cancellation

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositDataHash | bytes32 | The hash from the deposit data |
| calculatedHash | bytes32 | The hash calculated from given input |

### SenderIsNotScrollMessenger

```solidity
error SenderIsNotScrollMessenger()
```

Error thrown when the sender is not the Scroll Messenger in onlyWithdrawal context

### WithdrawalAddressNotSet

```solidity
error WithdrawalAddressNotSet()
```

Error thrown when the withdrawal contract address is not set

### InvalidWithdrawalAddress

```solidity
error InvalidWithdrawalAddress()
```

Error thrown when the xDomainMessageSender of the Scroll Messenger doesn't match the withdrawal contract address

### WithdrawalNotFound

```solidity
error WithdrawalNotFound(bytes32 withdrawalHash)
```

Error thrown when trying to claim a non-existent withdrawal

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawalHash | bytes32 | The hash of the withdrawal that wasn't found |

### TriedToDepositZero

```solidity
error TriedToDepositZero()
```

Error thrown when trying to deposit zero amount of native/ERC20/ERC1155 tokens

### AlreadyRelayed

```solidity
error AlreadyRelayed()
```

Error thrown when already relayed deposits

### DepositHashAlreadyExists

```solidity
error DepositHashAlreadyExists(bytes32 depositHash)
```

Error thrown when the deposit hash already exists

### DepositAmountExceedsLimit

```solidity
error DepositAmountExceedsLimit(uint256 depositAmount, uint256 limit)
```

Error thrown when the deposit amount exceeds the limit

### AmlValidationFailed

```solidity
error AmlValidationFailed()
```

Error thrown when aml Validation failed

### EligibilityValidationFailed

```solidity
error EligibilityValidationFailed()
```

Error thrown when eligibility Validation failed

### WithdrawalFeeRatioExceedsLimit

```solidity
error WithdrawalFeeRatioExceedsLimit()
```

Error thrown when the admin tries to set fee more than WITHDRAWAL_FEE_RATIO_LIMIT

### Deposited

```solidity
event Deposited(uint256 depositId, address sender, bytes32 recipientSaltHash, uint32 tokenIndex, uint256 amount, bool isEligible, uint256 depositedAt)
```

Event emitted when a deposit is made

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The unique identifier for the deposit |
| sender | address | The address that made the deposit |
| recipientSaltHash | bytes32 | The hash of the recipient's intmax2 address (BLS public key) and a secret salt |
| tokenIndex | uint32 | The index of the token being deposited |
| amount | uint256 | The amount of tokens deposited |
| isEligible | bool | if true, the deposit is eligible |
| depositedAt | uint256 | The timestamp of the deposit |

### DepositsRelayed

```solidity
event DepositsRelayed(uint256 upToDepositId, uint256 gasLimit, bytes message)
```

Event emitted when deposits are relayed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upToDepositId | uint256 | The highest deposit ID that was relayed |
| gasLimit | uint256 | The gas limit for the L2 transaction |
| message | bytes | Additional message data |

### DepositCanceled

```solidity
event DepositCanceled(uint256 depositId)
```

Event emitted when a deposit is canceled

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the canceled deposit |

### WithdrawalClaimable

```solidity
event WithdrawalClaimable(bytes32 withdrawalHash)
```

Event emitted when a withdrawal becomes claimable

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawalHash | bytes32 | The hash of the claimable withdrawal |

### DirectWithdrawalSuccessed

```solidity
event DirectWithdrawalSuccessed(bytes32 withdrawalHash, address recipient)
```

Event emitted when a direct withdrawal succeeds

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawalHash | bytes32 | The hash of the successful withdrawal |
| recipient | address |  |

### DirectWithdrawalFailed

```solidity
event DirectWithdrawalFailed(bytes32 withdrawalHash, struct WithdrawalLib.Withdrawal withdrawal)
```

Event emitted when a direct withdrawal fails, and the funds become claimable

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawalHash | bytes32 | The hash of the failed withdrawal |
| withdrawal | struct WithdrawalLib.Withdrawal | The withdrawal data |

### ClaimedWithdrawal

```solidity
event ClaimedWithdrawal(address recipient, bytes32 withdrawalHash)
```

Event emitted when a withdrawal is claimed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address that claimed the withdrawal |
| withdrawalHash | bytes32 | The hash of the claimed withdrawal |

### WithdrawalFeeCollected

```solidity
event WithdrawalFeeCollected(uint32 token, uint256 amount)
```

Event emitted when withdrawal fee is collected

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | uint32 | The index of the token |
| amount | uint256 | The amount of tokens collected |

### WithdrawalFeeWithdrawn

```solidity
event WithdrawalFeeWithdrawn(address recipient, uint32 token, uint256 amount)
```

Event emitted when withdrawal fee are withdrawn

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address that claimed the fees |
| token | uint32 | The index of the token |
| amount | uint256 | The amount of tokens claimed |

### PermitterSet

```solidity
event PermitterSet(address amlPermitter, address eligibilityPermitter)
```

Event emitted when permitter addresses are set

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amlPermitter | address | The address of the AML permitter contract |
| eligibilityPermitter | address | The address of the eligibility permitter contract |

### WithdrawalFeeRatioSet

```solidity
event WithdrawalFeeRatioSet(uint32 tokenIndex, uint256 feeRatio)
```

Event emitted when the withdrawal fee ratio is set

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint32 | The index of the token |
| feeRatio | uint256 | The withdrawal fee ratio for the token |

### pauseDeposits

```solidity
function pauseDeposits() external
```

Pause deposits

### unpauseDeposits

```solidity
function unpauseDeposits() external
```

Unpause deposits

### setPermitter

```solidity
function setPermitter(address _amlPermitter, address _eligibilityPermitter) external
```

Sets the AML and eligibility permitter addresses

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amlPermitter | address | The address of the AML permitter contract |
| _eligibilityPermitter | address | The address of the eligibility permitter contract |

### setWithdrawalFeeRatio

```solidity
function setWithdrawalFeeRatio(uint32 tokenIndex, uint256 feeRatio) external
```

Sets the withdrawal fee ratio for a token

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint32 | The index of the token |
| feeRatio | uint256 | The withdrawal fee ratio for the token |

### withdrawCollectedFees

```solidity
function withdrawCollectedFees(address recipient, uint32[] tokenIndices) external
```

Withdraw collected fees

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address that will receive the fees |
| tokenIndices | uint32[] | The indices of the tokens to withdraw fees from |

### depositNativeToken

```solidity
function depositNativeToken(bytes32 recipientSaltHash, bytes amlPermission, bytes eligibilityPermission) external payable
```

Deposit native token

_recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### depositERC20

```solidity
function depositERC20(address tokenAddress, bytes32 recipientSaltHash, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC20 token

_Requires prior approval for this contract to spend the tokens
recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | The address of the ERC20 token contract |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| amount | uint256 | The amount of tokens to deposit |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### depositERC721

```solidity
function depositERC721(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit an ERC721 token

_Requires prior approval for this contract to transfer the token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | The address of the ERC721 token contract |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId | uint256 | The ID of the token to deposit |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### depositERC1155

```solidity
function depositERC1155(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC1155 tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | The address of the ERC1155 token contract |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId | uint256 | The ID of the token to deposit |
| amount | uint256 | The amount of tokens to deposit |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### relayDeposits

```solidity
function relayDeposits(uint256 upToDepositId, uint256 gasLimit) external payable
```

Trusted nodes submit the IDs of deposits that do not meet AML standards by this method

_upToDepositId specifies the last deposit id that have been relayed. It must be greater than lastRelayedDeposit and less than or equal to the latest Deposit ID._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upToDepositId | uint256 | The upper limit of the Deposit ID that has been relayed. It must be greater than lastRelayedDeposit and less than or equal to the latest Deposit ID. |
| gasLimit | uint256 | The gas limit for the l2 transaction. |

### cancelDeposit

```solidity
function cancelDeposit(uint256 depositId, struct DepositLib.Deposit deposit) external
```

Method to cancel a deposit

_The deposit ID and its content should be included in the calldata_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit to cancel |
| deposit | struct DepositLib.Deposit | The deposit data |

### processWithdrawals

```solidity
function processWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals, bytes32[] withdrawalHashes) external
```

Process withdrawals, called by the scroll messenger

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawals | struct WithdrawalLib.Withdrawal[] | Array of withdrawals to process |
| withdrawalHashes | bytes32[] | Array of withdrawal hashes |

### getLastRelayedDepositId

```solidity
function getLastRelayedDepositId() external view returns (uint256)
```

Get the ID of the last deposit relayed to L2

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The ID of the last relayed deposit |

### getLastDepositId

```solidity
function getLastDepositId() external view returns (uint256)
```

Get the ID of the last deposit to L2

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The ID of the last deposit |

### getDepositData

```solidity
function getDepositData(uint256 depositId) external view returns (struct DepositQueueLib.DepositData)
```

Get deposit data for a given deposit ID

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DepositQueueLib.DepositData | The deposit data |

### getDepositDataBatch

```solidity
function getDepositDataBatch(uint256[] depositIds) external view returns (struct DepositQueueLib.DepositData[])
```

Get deposit data list for a given deposit IDs

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositIds | uint256[] | The IDs of the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DepositQueueLib.DepositData[] | The deposit data list |

### getDepositDataHash

```solidity
function getDepositDataHash(uint256 depositId) external view returns (bytes32)
```

Get deposit data hash for a given deposit ID

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The deposit data hash |

### claimWithdrawals

```solidity
function claimWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals) external
```

Claim withdrawals for tokens that are not direct withdrawals

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawals | struct WithdrawalLib.Withdrawal[] | Array of withdrawals to claim |

### isDepositValid

```solidity
function isDepositValid(uint256 depositId, bytes32 recipientSaltHash, uint32 tokenIndex, uint256 amount, bool isEligible, address sender) external view returns (bool)
```

Check if the deposit is valid

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit |
| recipientSaltHash | bytes32 | The hash of the recipient's intmax2 address (BLS public key) and a secret salt |
| tokenIndex | uint32 | The index of the token being deposited |
| amount | uint256 | The amount of tokens deposited |
| isEligible | bool | Whether the deposit is eligible for mining rewards |
| sender | address | The address that made the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the deposit is valid |

### onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) external pure returns (bytes4)
```

ERC1155 token receiver function

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes4 | bytes4 The function selector |

## ITokenData

### TokenAddressIsZero

```solidity
error TokenAddressIsZero()
```

Error thrown when attempting to use a zero address for a token

### TokenType

Enum representing different token types

```solidity
enum TokenType {
  NATIVE,
  ERC20,
  ERC721,
  ERC1155
}
```

### TokenInfo

Struct containing information about a token

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct TokenInfo {
  enum ITokenData.TokenType tokenType;
  address tokenAddress;
  uint256 tokenId;
}
```

### getTokenInfo

```solidity
function getTokenInfo(uint32 tokenIndex) external view returns (struct ITokenData.TokenInfo)
```

Retrieves token information for a given token index

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint32 | The index of the token |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ITokenData.TokenInfo | TokenInfo struct containing the token's information |

### getTokenIndex

```solidity
function getTokenIndex(enum ITokenData.TokenType tokenType, address tokenAddress, uint256 tokenId) external view returns (bool, uint32)
```

Retrieves the token index for given token parameters

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenType | enum ITokenData.TokenType | The type of the token (NATIVE, ERC20, ERC721, ERC1155) |
| tokenAddress | address | The address of the token contract (zero address for native tokens) |
| tokenId | uint256 | The ID of the token (used for ERC721 and ERC1155) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool Indicating whether the token index was found |
| [1] | uint32 | uint32 The index of the token if found |

### getNativeTokenIndex

```solidity
function getNativeTokenIndex() external view returns (uint32)
```

Retrieves the index of the native token

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | uint32 The index of the native token |

## Liquidity

### RELAYER

```solidity
bytes32 RELAYER
```

Relayer role constant

### WITHDRAWAL

```solidity
bytes32 WITHDRAWAL
```

Withdrawal role constant

### WITHDRAWAL_FEE_RATIO_LIMIT

```solidity
uint256 WITHDRAWAL_FEE_RATIO_LIMIT
```

Max withdrawal fee ratio limit

_1bp = 0.01%_

### deploymentTime

```solidity
uint256 deploymentTime
```

Deployment time which is used to calculate the deposit limit

### amlPermitter

```solidity
contract IPermitter amlPermitter
```

Address of the AML Permitter contract

_If not set, we skip AML check_

### eligibilityPermitter

```solidity
contract IPermitter eligibilityPermitter
```

Address of the Circulation Permitter contract

_If not set, we skip eligibility permission check_

### claimableWithdrawals

```solidity
mapping(bytes32 => uint256) claimableWithdrawals
```

Mapping of deposit hashes to a boolean indicating whether the deposit hash exists

### withdrawalFeeRatio

```solidity
mapping(uint32 => uint256) withdrawalFeeRatio
```

Withdrawal fee ratio for each token index

_1bp = 0.01%_

### collectedWithdrawalFees

```solidity
mapping(uint32 => uint256) collectedWithdrawalFees
```

Mapping of token index to the total amount of withdrawal fees collected

### onlyWithdrawalRole

```solidity
modifier onlyWithdrawalRole()
```

### canCancelDeposit

```solidity
modifier canCancelDeposit(uint256 depositId, struct DepositLib.Deposit deposit)
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _l1ScrollMessenger, address _rollup, address _withdrawal, address _claim, address _relayer, address _contribution, address[] initialERC20Tokens) external
```

Initializes the contract with required addresses and parameters

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _admin | address | The address that will have admin privileges |
| _l1ScrollMessenger | address | The address of the L1ScrollMessenger contract |
| _rollup | address | The address of the Rollup contract |
| _withdrawal | address | The address that will have withdrawal privileges |
| _claim | address | The address that will have claim privileges |
| _relayer | address | The address that will have relayer privileges |
| _contribution | address | The address of the Contribution contract |
| initialERC20Tokens | address[] | Initial list of ERC20 token addresses to support |

### setPermitter

```solidity
function setPermitter(address _amlPermitter, address _eligibilityPermitter) external
```

Sets the AML and eligibility permitter addresses

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amlPermitter | address | The address of the AML permitter contract |
| _eligibilityPermitter | address | The address of the eligibility permitter contract |

### setWithdrawalFeeRatio

```solidity
function setWithdrawalFeeRatio(uint32 tokenIndex, uint256 feeRatio) external
```

Sets the withdrawal fee ratio for a token

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint32 | The index of the token |
| feeRatio | uint256 | The withdrawal fee ratio for the token |

### withdrawCollectedFees

```solidity
function withdrawCollectedFees(address recipient, uint32[] tokenIndices) external
```

Withdraw collected fees

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address that will receive the fees |
| tokenIndices | uint32[] | The indices of the tokens to withdraw fees from |

### pauseDeposits

```solidity
function pauseDeposits() external
```

Pause deposits

### unpauseDeposits

```solidity
function unpauseDeposits() external
```

Unpause deposits

### depositNativeToken

```solidity
function depositNativeToken(bytes32 recipientSaltHash, bytes amlPermission, bytes eligibilityPermission) external payable
```

Deposit native token

_recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### depositERC20

```solidity
function depositERC20(address tokenAddress, bytes32 recipientSaltHash, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC20 token

_Requires prior approval for this contract to spend the tokens
recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | The address of the ERC20 token contract |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| amount | uint256 | The amount of tokens to deposit |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### depositERC721

```solidity
function depositERC721(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit an ERC721 token

_Requires prior approval for this contract to transfer the token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | The address of the ERC721 token contract |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId | uint256 | The ID of the token to deposit |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### depositERC1155

```solidity
function depositERC1155(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC1155 tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | The address of the ERC1155 token contract |
| recipientSaltHash | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId | uint256 | The ID of the token to deposit |
| amount | uint256 | The amount of tokens to deposit |
| amlPermission | bytes | The data to verify AML check |
| eligibilityPermission | bytes | The data to verify eligibility check |

### relayDeposits

```solidity
function relayDeposits(uint256 upToDepositId, uint256 gasLimit) external payable
```

Trusted nodes submit the IDs of deposits that do not meet AML standards by this method

_upToDepositId specifies the last deposit id that have been relayed. It must be greater than lastRelayedDeposit and less than or equal to the latest Deposit ID._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upToDepositId | uint256 | The upper limit of the Deposit ID that has been relayed. It must be greater than lastRelayedDeposit and less than or equal to the latest Deposit ID. |
| gasLimit | uint256 | The gas limit for the l2 transaction. |

### claimWithdrawals

```solidity
function claimWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals) external
```

Claim withdrawals for tokens that are not direct withdrawals

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawals | struct WithdrawalLib.Withdrawal[] | Array of withdrawals to claim |

### cancelDeposit

```solidity
function cancelDeposit(uint256 depositId, struct DepositLib.Deposit deposit) external
```

Method to cancel a deposit

_The deposit ID and its content should be included in the calldata_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit to cancel |
| deposit | struct DepositLib.Deposit | The deposit data |

### processWithdrawals

```solidity
function processWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals, bytes32[] withdrawalHashes) external
```

Process withdrawals, called by the scroll messenger

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawals | struct WithdrawalLib.Withdrawal[] | Array of withdrawals to process |
| withdrawalHashes | bytes32[] | Array of withdrawal hashes |

### _processDirectWithdrawal

```solidity
function _processDirectWithdrawal(struct WithdrawalLib.Withdrawal withdrawal_) internal
```

### onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) external pure returns (bytes4)
```

ERC1155 token receiver function

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes4 | bytes4 The function selector |

### isDepositValid

```solidity
function isDepositValid(uint256 depositId, bytes32 recipientSaltHash, uint32 tokenIndex, uint256 amount, bool isEligible, address sender) external view returns (bool)
```

Check if the deposit is valid

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit |
| recipientSaltHash | bytes32 | The hash of the recipient's intmax2 address (BLS public key) and a secret salt |
| tokenIndex | uint32 | The index of the token being deposited |
| amount | uint256 | The amount of tokens deposited |
| isEligible | bool | Whether the deposit is eligible for mining rewards |
| sender | address | The address that made the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the deposit is valid |

### getDepositData

```solidity
function getDepositData(uint256 depositId) external view returns (struct DepositQueueLib.DepositData)
```

Get deposit data for a given deposit ID

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DepositQueueLib.DepositData | The deposit data |

### getDepositDataBatch

```solidity
function getDepositDataBatch(uint256[] depositIds) external view returns (struct DepositQueueLib.DepositData[])
```

Get deposit data list for a given deposit IDs

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositIds | uint256[] | The IDs of the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DepositQueueLib.DepositData[] | The deposit data list |

### getDepositDataHash

```solidity
function getDepositDataHash(uint256 depositId) external view returns (bytes32)
```

Get deposit data hash for a given deposit ID

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the deposit |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The deposit data hash |

### getLastRelayedDepositId

```solidity
function getLastRelayedDepositId() public view returns (uint256)
```

Get the ID of the last deposit relayed to L2

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The ID of the last relayed deposit |

### getLastDepositId

```solidity
function getLastDepositId() external view returns (uint256)
```

Get the ID of the last deposit to L2

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The ID of the last deposit |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

## TokenData

### __TokenData_init

```solidity
function __TokenData_init(address[] initialERC20Tokens) internal
```

### _getOrCreateTokenIndex

```solidity
function _getOrCreateTokenIndex(enum ITokenData.TokenType tokenType, address tokenAddress, uint256 tokenId) internal returns (uint32)
```

### getNativeTokenIndex

```solidity
function getNativeTokenIndex() public pure returns (uint32)
```

Retrieves the index of the native token

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | uint32 The index of the native token |

### getTokenIndex

```solidity
function getTokenIndex(enum ITokenData.TokenType tokenType, address tokenAddress, uint256 tokenId) public view returns (bool, uint32)
```

Retrieves the token index for given token parameters

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenType | enum ITokenData.TokenType | The type of the token (NATIVE, ERC20, ERC721, ERC1155) |
| tokenAddress | address | The address of the token contract (zero address for native tokens) |
| tokenId | uint256 | The ID of the token (used for ERC721 and ERC1155) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool Indicating whether the token index was found |
| [1] | uint32 | uint32 The index of the token if found |

### getTokenInfo

```solidity
function getTokenInfo(uint32 tokenIndex) public view returns (struct ITokenData.TokenInfo)
```

Retrieves token information for a given token index

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint32 | The index of the token |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ITokenData.TokenInfo | TokenInfo struct containing the token's information |

## DepositLimit

### ETH_INDEX

```solidity
uint8 ETH_INDEX
```

### WBTC_INDEX

```solidity
uint8 WBTC_INDEX
```

### USDC_INDEX

```solidity
uint8 USDC_INDEX
```

### PERIOD_1

```solidity
uint16 PERIOD_1
```

### PERIOD_2

```solidity
uint16 PERIOD_2
```

### PERIOD_3

```solidity
uint16 PERIOD_3
```

### PERIOD_4

```solidity
uint16 PERIOD_4
```

### ETH_LIMIT_0

```solidity
uint256 ETH_LIMIT_0
```

### ETH_LIMIT_1

```solidity
uint256 ETH_LIMIT_1
```

### ETH_LIMIT_2

```solidity
uint256 ETH_LIMIT_2
```

### ETH_LIMIT_3

```solidity
uint256 ETH_LIMIT_3
```

### ETH_LIMIT_4

```solidity
uint256 ETH_LIMIT_4
```

### WBTC_LIMIT_0

```solidity
uint256 WBTC_LIMIT_0
```

### WBTC_LIMIT_1

```solidity
uint256 WBTC_LIMIT_1
```

### WBTC_LIMIT_2

```solidity
uint256 WBTC_LIMIT_2
```

### WBTC_LIMIT_3

```solidity
uint256 WBTC_LIMIT_3
```

### WBTC_LIMIT_4

```solidity
uint256 WBTC_LIMIT_4
```

### USDC_LIMIT_0

```solidity
uint256 USDC_LIMIT_0
```

### USDC_LIMIT_1

```solidity
uint256 USDC_LIMIT_1
```

### USDC_LIMIT_2

```solidity
uint256 USDC_LIMIT_2
```

### USDC_LIMIT_3

```solidity
uint256 USDC_LIMIT_3
```

### USDC_LIMIT_4

```solidity
uint256 USDC_LIMIT_4
```

### getDepositLimit

```solidity
function getDepositLimit(uint32 tokenIndex, uint256 deploymentTime) internal view returns (uint256 limit)
```

Returns the deposit limit for a token at a given deployment time

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint32 | The index of the token |
| deploymentTime | uint256 | The timestamp of the deployment |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| limit | uint256 | The deposit limit for the token |

## DepositQueueLib

A library for managing a queue of pending deposits

### OutOfRange

```solidity
error OutOfRange(uint256 upToDepositId, uint256 firstDepositId, uint256 lastDepositId)
```

Error thrown when trying to deposits outside the queue range

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| upToDepositId | uint256 | The requested deposit ID |
| firstDepositId | uint256 | The first deposit ID in the queue |
| lastDepositId | uint256 | The last deposit ID in the queue |

### DepositQueue

Represents a queue of pending deposits

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct DepositQueue {
  struct DepositQueueLib.DepositData[] depositData;
  uint256 front;
}
```

### DepositData

Represents data for a single deposit

_Includes deposit hash, sender address_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct DepositData {
  bytes32 depositHash;
  address sender;
}
```

### initialize

```solidity
function initialize(struct DepositQueueLib.DepositQueue depositQueue) internal
```

Initializes the deposit queue

_Pushes a dummy element to make the queue 1-indexed_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositQueue | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct |

### enqueue

```solidity
function enqueue(struct DepositQueueLib.DepositQueue depositQueue, bytes32 depositHash, address sender) internal returns (uint256 depositId)
```

Adds a new deposit to the queue

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositQueue | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct |
| depositHash | bytes32 | The hash of the deposit |
| sender | address | The address of the depositor |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositId | uint256 | The ID of the newly added deposit |

### deleteDeposit

```solidity
function deleteDeposit(struct DepositQueueLib.DepositQueue depositQueue, uint256 depositId) internal returns (struct DepositQueueLib.DepositData depositData)
```

Deletes a deposit from the queue

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositQueue | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct |
| depositId | uint256 | The ID of the deposit to be deleted |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositData | struct DepositQueueLib.DepositData | The data of the deleted deposit |

### batchDequeue

```solidity
function batchDequeue(struct DepositQueueLib.DepositQueue depositQueue, uint256 upToDepositId) internal returns (bytes32[])
```

relayed deposits in the queue

_Collects deposit hashes from front to upToDepositId_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositQueue | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct |
| upToDepositId | uint256 | The upper bound deposit ID |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32[] | An array of deposit hashes |

## ERC20CallOptionalLib

### callOptionalReturnBool

```solidity
function callOptionalReturnBool(contract IERC20 token, bytes data) internal returns (bool)
```

_Referring to _callOptionalReturnBool of SafeERC20.sol_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token targeted by the call. |
| data | bytes | The call data (encoded using abi.encode or one of its variants). |

## IPermitter

### permit

```solidity
function permit(address user, uint256 value, bytes encodedData, bytes permission) external returns (bool authorized)
```

Validates if a user has the right to execute a specified action

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user attempting the action |
| value | uint256 | The msg.value of the transaction |
| encodedData | bytes | The encoded data of the action that user wants to execute |
| permission | bytes | The permission data that proves user authorization |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| authorized | bool | Returns true if the user is authorized, false otherwise |

## IRollup

Interface for the Rollup contract

### AddressZero

```solidity
error AddressZero()
```

address is zero address

### OnlyScrollMessenger

```solidity
error OnlyScrollMessenger()
```

Error thrown when a non-ScrollMessenger calls a function restricted to ScrollMessenger

### OnlyLiquidity

```solidity
error OnlyLiquidity()
```

Error thrown when the xDomainMessageSender in ScrollMessenger is not the liquidity contract

### TooManySenderPublicKeys

```solidity
error TooManySenderPublicKeys()
```

Error thrown when the number of public keys exceeds 128

### TooManyAccountIds

```solidity
error TooManyAccountIds()
```

Error thrown when the number of account IDs exceeds 128

### SenderAccountIdsInvalidLength

```solidity
error SenderAccountIdsInvalidLength()
```

Error thrown when the length of account IDs bytes is not a multiple of 5

### PairingCheckFailed

```solidity
error PairingCheckFailed()
```

Error thrown when the posted block fails the pairing test

### BlockNumberOutOfRange

```solidity
error BlockNumberOutOfRange()
```

Error thrown when the specified block number is greater than the latest block number

### InsufficientPenaltyFee

```solidity
error InsufficientPenaltyFee()
```

Error thrown when the fee for the rate limiter is insufficient

### Expired

```solidity
error Expired()
```

Error thrown when the expiry timestamp is in the past

### InvalidNonce

```solidity
error InvalidNonce()
```

Error thrown when the given nonce is less than the current nonce

### DepositsProcessed

```solidity
event DepositsProcessed(uint256 lastProcessedDepositId, bytes32 depositTreeRoot)
```

Event emitted when deposits bridged from the liquidity contract are processed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lastProcessedDepositId | uint256 | The ID of the last processed deposit |
| depositTreeRoot | bytes32 | The root of the deposit tree after processing |

### DepositLeafInserted

```solidity
event DepositLeafInserted(uint32 depositIndex, bytes32 depositHash)
```

Event emitted when a deposit is inserted into the deposit tree

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositIndex | uint32 | The index of the deposit |
| depositHash | bytes32 | The hash of the deposit |

### BlockPosted

```solidity
event BlockPosted(bytes32 prevBlockHash, address blockBuilder, uint64 timestamp, uint256 blockNumber, bytes32 depositTreeRoot, bytes32 signatureHash)
```

Event emitted when a new block is posted

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| prevBlockHash | bytes32 | The hash of the previous block |
| blockBuilder | address | The address of the block builder |
| timestamp | uint64 | The timestamp of the posted block |
| blockNumber | uint256 | The number of the posted block |
| depositTreeRoot | bytes32 | The root of the deposit tree |
| signatureHash | bytes32 | The hash of the signature |

### BlockPostData

An internal struct to store the data of block to avoid stack too deep error

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct BlockPostData {
  bool isRegistrationBlock;
  bytes32 txTreeRoot;
  uint64 expiry;
  address builderAddress;
  uint32 builderNonce;
  bytes16 senderFlags;
  bytes32[2] aggregatedPublicKey;
  bytes32[4] aggregatedSignature;
  bytes32[4] messagePoint;
}
```

### postRegistrationBlock

```solidity
function postRegistrationBlock(bytes32 txTreeRoot, uint64 expiry, uint32 builderNonce, bytes16 senderFlags, bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint, uint256[] senderPublicKeys) external payable
```

Posts a registration block (for all senders' first transactions, specified by public keys)

_msg.value must be greater than or equal to the penalty fee of the rate limiter_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| txTreeRoot | bytes32 | The root of the transaction tree |
| expiry | uint64 | The expiry timestamp of the tx tree root. Zero means no expiry. |
| builderNonce | uint32 | The registration block nonce of the block builder |
| senderFlags | bytes16 | Flags indicating whether senders' signatures are included in the aggregated signature |
| aggregatedPublicKey | bytes32[2] | The aggregated public key |
| aggregatedSignature | bytes32[4] | The aggregated signature |
| messagePoint | bytes32[4] | The hash of the tx tree root to G2 |
| senderPublicKeys | uint256[] | The public keys of the senders |

### postNonRegistrationBlock

```solidity
function postNonRegistrationBlock(bytes32 txTreeRoot, uint64 expiry, uint32 builderNonce, bytes16 senderFlags, bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint, bytes32 publicKeysHash, bytes senderAccountIds) external payable
```

Posts a non-registration block (for all senders' subsequent transactions, specified by account IDs)

_msg.value must be greater than or equal to the penalty fee of the rate limiter_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| txTreeRoot | bytes32 | The root of the transaction tree |
| expiry | uint64 | The expiry timestamp of the tx tree root. Zero means no expiry. |
| builderNonce | uint32 | The non registration block nonce of the block builder |
| senderFlags | bytes16 | Sender flags |
| aggregatedPublicKey | bytes32[2] | The aggregated public key |
| aggregatedSignature | bytes32[4] | The aggregated signature |
| messagePoint | bytes32[4] | The hash of the tx tree root to G2 |
| publicKeysHash | bytes32 | The hash of the public keys |
| senderAccountIds | bytes | The account IDs arranged in a byte sequence |

### withdrawPenaltyFee

```solidity
function withdrawPenaltyFee(address to) external
```

Withdraws the penalty fee from the Rollup contract

_Only the owner can call this function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address to which the penalty fee is transferred |

### processDeposits

```solidity
function processDeposits(uint256 lastProcessedDepositId, bytes32[] depositHashes) external
```

Update the deposit tree branch and root

_Only Liquidity contract can call this function via Scroll Messenger_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lastProcessedDepositId | uint256 | The ID of the last processed deposit |
| depositHashes | bytes32[] | The hashes of the deposits |

### getLatestBlockNumber

```solidity
function getLatestBlockNumber() external view returns (uint32)
```

Get the block number of the latest posted block

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | The latest block number |

### getPenalty

```solidity
function getPenalty() external view returns (uint256)
```

Get current penalty fee for rate limiter

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The penalty fee for next block |

### getBlockHash

```solidity
function getBlockHash(uint32 blockNumber) external view returns (bytes32)
```

Get the block hash for a specific block number

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockNumber | uint32 | The block number to query |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The hash of the specified block |

## IWithdrawal

### AddressZero

```solidity
error AddressZero()
```

address is zero address

### WithdrawalChainVerificationFailed

```solidity
error WithdrawalChainVerificationFailed()
```

Error thrown when the verification of the withdrawal proof's public input hash chain fails

### WithdrawalAggregatorMismatch

```solidity
error WithdrawalAggregatorMismatch()
```

Error thrown when the aggregator in the withdrawal proof's public input doesn't match the actual contract executor

### BlockHashNotExists

```solidity
error BlockHashNotExists(bytes32 blockHash)
```

Error thrown when the block hash in the withdrawal proof's public input doesn't exist

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockHash | bytes32 | The non-existent block hash |

### WithdrawalProofVerificationFailed

```solidity
error WithdrawalProofVerificationFailed()
```

Error thrown when the ZKP verification of the withdrawal proof fails

### TokenAlreadyExist

```solidity
error TokenAlreadyExist(uint256 tokenIndex)
```

Error thrown when attempting to add a token to direct withdrawal tokens that already exists

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint256 | The index of the token that already exists |

### TokenNotExist

```solidity
error TokenNotExist(uint256 tokenIndex)
```

Error thrown when attempting to remove a non-existent token from direct withdrawal tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndex | uint256 | The index of the non-existent token |

### ClaimableWithdrawalQueued

```solidity
event ClaimableWithdrawalQueued(bytes32 withdrawalHash, address recipient, struct WithdrawalLib.Withdrawal withdrawal)
```

Emitted when a claimable withdrawal is queued

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawalHash | bytes32 | The hash of the withdrawal |
| recipient | address | The address of the recipient |
| withdrawal | struct WithdrawalLib.Withdrawal | The withdrawal details |

### DirectWithdrawalQueued

```solidity
event DirectWithdrawalQueued(bytes32 withdrawalHash, address recipient, struct WithdrawalLib.Withdrawal withdrawal)
```

Emitted when a direct withdrawal is queued

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawalHash | bytes32 | The hash of the withdrawal |
| recipient | address | The address of the recipient |
| withdrawal | struct WithdrawalLib.Withdrawal | The withdrawal details |

### DirectWithdrawalTokenIndicesAdded

```solidity
event DirectWithdrawalTokenIndicesAdded(uint256[] tokenIndices)
```

Emitted when direct withdrawal token indices are added

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndices | uint256[] | The token indices that were added |

### DirectWithdrawalTokenIndicesRemoved

```solidity
event DirectWithdrawalTokenIndicesRemoved(uint256[] tokenIndices)
```

Emitted when direct withdrawal token indices are removed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndices | uint256[] | The token indices that were removed |

### submitWithdrawalProof

```solidity
function submitWithdrawalProof(struct ChainedWithdrawalLib.ChainedWithdrawal[] withdrawals, struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs publicInputs, bytes proof) external
```

Submit withdrawal proof from intmax2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawals | struct ChainedWithdrawalLib.ChainedWithdrawal[] | List of chained withdrawals |
| publicInputs | struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs | Public inputs for the withdrawal proof |
| proof | bytes | The proof data |

### getDirectWithdrawalTokenIndices

```solidity
function getDirectWithdrawalTokenIndices() external view returns (uint256[])
```

Get the token indices for direct withdrawals

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of token indices |

### addDirectWithdrawalTokenIndices

```solidity
function addDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Add token indices to the list of direct withdrawal token indices
ERC721 and ERC1155 tokens are not supported for direct withdrawal.
When transferred to the liquidity contract, they will be converted to claimable withdrawals.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndices | uint256[] | The token indices to add |

### removeDirectWithdrawalTokenIndices

```solidity
function removeDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Remove token indices from the list of direct withdrawal token indices

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndices | uint256[] | The token indices to remove |

## Withdrawal

### directWithdrawalTokenIndices

```solidity
struct EnumerableSet.UintSet directWithdrawalTokenIndices
```

direct withdrawal token indices

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _scrollMessenger, address _withdrawalVerifier, address _liquidity, address _rollup, address _contribution, uint256[] _directWithdrawalTokenIndices) external
```

### submitWithdrawalProof

```solidity
function submitWithdrawalProof(struct ChainedWithdrawalLib.ChainedWithdrawal[] withdrawals, struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs publicInputs, bytes proof) external
```

Submit withdrawal proof from intmax2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawals | struct ChainedWithdrawalLib.ChainedWithdrawal[] | List of chained withdrawals |
| publicInputs | struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs | Public inputs for the withdrawal proof |
| proof | bytes | The proof data |

### getDirectWithdrawalTokenIndices

```solidity
function getDirectWithdrawalTokenIndices() external view returns (uint256[])
```

Get the token indices for direct withdrawals

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of token indices |

### addDirectWithdrawalTokenIndices

```solidity
function addDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Add token indices to the list of direct withdrawal token indices
ERC721 and ERC1155 tokens are not supported for direct withdrawal.
When transferred to the liquidity contract, they will be converted to claimable withdrawals.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndices | uint256[] | The token indices to add |

### removeDirectWithdrawalTokenIndices

```solidity
function removeDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Remove token indices from the list of direct withdrawal token indices

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIndices | uint256[] | The token indices to remove |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

## ChainedWithdrawalLib

Library for handling chained withdrawals in a hash chain

### ChainedWithdrawal

Represents a withdrawal linked in a hash chain, used in withdrawal proof public inputs

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct ChainedWithdrawal {
  address recipient;
  uint32 tokenIndex;
  uint256 amount;
  bytes32 nullifier;
  bytes32 blockHash;
  uint32 blockNumber;
}
```

### verifyWithdrawalChain

```solidity
function verifyWithdrawalChain(struct ChainedWithdrawalLib.ChainedWithdrawal[] withdrawals, bytes32 lastWithdrawalHash) internal pure returns (bool)
```

Verifies the integrity of a withdrawal hash chain

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawals | struct ChainedWithdrawalLib.ChainedWithdrawal[] | Array of ChainedWithdrawals to verify |
| lastWithdrawalHash | bytes32 | The expected hash of the last withdrawal in the chain |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool True if the chain is valid, false otherwise |

## WithdrawalProofPublicInputsLib

### WithdrawalProofPublicInputs

Represents the public inputs for a withdrawal proof

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct WithdrawalProofPublicInputs {
  bytes32 lastWithdrawalHash;
  address withdrawalAggregator;
}
```

### getHash

```solidity
function getHash(struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs inputs) internal pure returns (bytes32)
```

Computes the hash of the WithdrawalProofPublicInputs

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| inputs | struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs | The WithdrawalProofPublicInputs to be hashed |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | bytes32 The resulting hash |

## Rollup

### lastProcessedDepositId

```solidity
uint256 lastProcessedDepositId
```

The ID of the last processed deposit

### blockHashes

```solidity
bytes32[] blockHashes
```

block hashes

### builderRegistrationNonce

```solidity
mapping(address => uint32) builderRegistrationNonce
```

block builder's nonce for registration block

### builderNonRegistrationNonce

```solidity
mapping(address => uint32) builderNonRegistrationNonce
```

block builder's nonce for non-registration block

### depositTreeRoot

```solidity
bytes32 depositTreeRoot
```

deposit tree root

### depositIndex

```solidity
uint32 depositIndex
```

deposit index

### onlyLiquidityContract

```solidity
modifier onlyLiquidityContract()
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _scrollMessenger, address _liquidity, address _contribution) external
```

### postRegistrationBlock

```solidity
function postRegistrationBlock(bytes32 txTreeRoot, uint64 expiry, uint32 builderNonce, bytes16 senderFlags, bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint, uint256[] senderPublicKeys) external payable
```

Posts a registration block (for all senders' first transactions, specified by public keys)

_msg.value must be greater than or equal to the penalty fee of the rate limiter_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| txTreeRoot | bytes32 | The root of the transaction tree |
| expiry | uint64 | The expiry timestamp of the tx tree root. Zero means no expiry. |
| builderNonce | uint32 | The registration block nonce of the block builder |
| senderFlags | bytes16 | Flags indicating whether senders' signatures are included in the aggregated signature |
| aggregatedPublicKey | bytes32[2] | The aggregated public key |
| aggregatedSignature | bytes32[4] | The aggregated signature |
| messagePoint | bytes32[4] | The hash of the tx tree root to G2 |
| senderPublicKeys | uint256[] | The public keys of the senders |

### postNonRegistrationBlock

```solidity
function postNonRegistrationBlock(bytes32 txTreeRoot, uint64 expiry, uint32 builderNonce, bytes16 senderFlags, bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint, bytes32 publicKeysHash, bytes senderAccountIds) external payable
```

Posts a non-registration block (for all senders' subsequent transactions, specified by account IDs)

_msg.value must be greater than or equal to the penalty fee of the rate limiter_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| txTreeRoot | bytes32 | The root of the transaction tree |
| expiry | uint64 | The expiry timestamp of the tx tree root. Zero means no expiry. |
| builderNonce | uint32 | The non registration block nonce of the block builder |
| senderFlags | bytes16 | Sender flags |
| aggregatedPublicKey | bytes32[2] | The aggregated public key |
| aggregatedSignature | bytes32[4] | The aggregated signature |
| messagePoint | bytes32[4] | The hash of the tx tree root to G2 |
| publicKeysHash | bytes32 | The hash of the public keys |
| senderAccountIds | bytes | The account IDs arranged in a byte sequence |

### processDeposits

```solidity
function processDeposits(uint256 _lastProcessedDepositId, bytes32[] depositHashes) external
```

### withdrawPenaltyFee

```solidity
function withdrawPenaltyFee(address to) external
```

Withdraws the penalty fee from the Rollup contract

_Only the owner can call this function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address to which the penalty fee is transferred |

### getLatestBlockNumber

```solidity
function getLatestBlockNumber() external view returns (uint32)
```

Get the block number of the latest posted block

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | The latest block number |

### getBlockHash

```solidity
function getBlockHash(uint32 blockNumber) external view returns (bytes32)
```

Get the block hash for a specific block number

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockNumber | uint32 | The block number to query |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The hash of the specified block |

### getPenalty

```solidity
function getPenalty() external view returns (uint256)
```

Get current penalty fee for rate limiter

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The penalty fee for next block |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

## BlockHashLib

### pushGenesisBlockHash

```solidity
function pushGenesisBlockHash(bytes32[] blockHashes, bytes32 initialDepositTreeRoot) internal
```

Pushes the genesis block hash to the block hashes array

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockHashes | bytes32[] | The storage array of block hashes |
| initialDepositTreeRoot | bytes32 | The initial deposit tree root for the genesis block |

### getBlockNumber

```solidity
function getBlockNumber(bytes32[] blockHashes) internal view returns (uint32)
```

Gets the current block number based on the number of block hashes

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockHashes | bytes32[] | The memory array of block hashes |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | The current block number |

### getPrevHash

```solidity
function getPrevHash(bytes32[] blockHashes) internal view returns (bytes32)
```

Gets the hash of the previous block

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockHashes | bytes32[] | The memory array of block hashes |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The hash of the previous block |

### pushBlockHash

```solidity
function pushBlockHash(bytes32[] blockHashes, bytes32 depositTreeRoot, bytes32 signatureHash, uint64 timestamp) internal returns (bytes32 blockHash)
```

Pushes a new block hash to the block hashes array

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockHashes | bytes32[] | The storage array of block hashes |
| depositTreeRoot | bytes32 | The deposit tree root for the new block |
| signatureHash | bytes32 | The signature hash for the new block |
| timestamp | uint64 |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockHash | bytes32 | The newly calculated and pushed block hash |

## DepositTreeLib

Library for managing a sparse Merkle tree for deposits

_Based on https://github.com/0xPolygonHermez/zkevm-contracts/blob/main/contracts/lib/DepositContract.sol_

### MerkleTreeFull

```solidity
error MerkleTreeFull()
```

Error thrown when the Merkle tree is full

### _DEPOSIT_CONTRACT_TREE_DEPTH

```solidity
uint256 _DEPOSIT_CONTRACT_TREE_DEPTH
```

_Depth of the Merkle tree_

### DepositTree

Structure representing the deposit tree

```solidity
struct DepositTree {
  bytes32[32] _branch;
  uint256 depositCount;
  bytes32 defaultHash;
}
```

### _MAX_DEPOSIT_COUNT

```solidity
uint256 _MAX_DEPOSIT_COUNT
```

_Maximum number of deposits (ensures depositCount fits into 32 bits)_

### initialize

```solidity
function initialize(struct DepositTreeLib.DepositTree depositTree) internal
```

Initializes the deposit tree

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositTree | struct DepositTreeLib.DepositTree | The storage reference to the DepositTree struct |

### getRoot

```solidity
function getRoot(struct DepositTreeLib.DepositTree depositTree) internal pure returns (bytes32)
```

Computes and returns the Merkle root

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositTree | struct DepositTreeLib.DepositTree | The memory reference to the DepositTree struct |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The computed Merkle root |

### deposit

```solidity
function deposit(struct DepositTreeLib.DepositTree depositTree, bytes32 leafHash) internal
```

Adds a new leaf to the Merkle tree

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositTree | struct DepositTreeLib.DepositTree | The storage reference to the DepositTree struct |
| leafHash | bytes32 | The hash of the new leaf to be added |

### getBranch

```solidity
function getBranch(struct DepositTreeLib.DepositTree depositTree) internal view returns (bytes32[32])
```

Retrieves the current branch of the Merkle tree

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositTree | struct DepositTreeLib.DepositTree | The storage reference to the DepositTree struct |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32[32] | The current branch of the Merkle tree |

## PairingLib

### PairingOpCodeFailed

```solidity
error PairingOpCodeFailed()
```

Error thrown when the pairing operation fails

### NEG_G1_X

```solidity
uint256 NEG_G1_X
```

_X-coordinate of the negated generator point G1_

### NEG_G1_Y

```solidity
uint256 NEG_G1_Y
```

_Y-coordinate of the negated generator point G1_

### pairing

```solidity
function pairing(bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint) internal view returns (bool)
```

Performs an elliptic curve pairing operation

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| aggregatedPublicKey | bytes32[2] | The aggregated public key (2 32-byte elements) |
| aggregatedSignature | bytes32[4] | The aggregated signature (4 32-byte elements) |
| messagePoint | bytes32[4] | The message point (4 32-byte elements) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool True if the pairing is valid, false otherwise |

## RateLimiterLib

A library for implementing a rate limiting mechanism with exponential moving average (EMA)

### RateLimitState

Struct to store the state of the rate limiter

```solidity
struct RateLimitState {
  uint256 lastCallTime;
  UD60x18 emaInterval;
}
```

### TARGET_INTERVAL

```solidity
uint256 TARGET_INTERVAL
```

### ALPHA

```solidity
uint256 ALPHA
```

### K

```solidity
uint256 K
```

### update

```solidity
function update(struct RateLimiterLib.RateLimitState state) internal returns (uint256)
```

Updates the rate limiter state and calculates the penalty.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct RateLimiterLib.RateLimitState | The current state of the rate limiter. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The calculated penalty. |

### getPenalty

```solidity
function getPenalty(struct RateLimiterLib.RateLimitState state) internal view returns (uint256)
```

Computes the penalty that would be applied by update, without changing state.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| state | struct RateLimiterLib.RateLimitState | The current state of the rate limiter. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The calculated penalty. |

## PredicatePermitter

### AddressZero

```solidity
error AddressZero()
```

address is zero address

### PolicyIDEmpty

```solidity
error PolicyIDEmpty()
```

policy id is empty

### PolicySet

```solidity
event PolicySet(string policyID)
```

Emitted when the policy is set

### PredicateManagerSet

```solidity
event PredicateManagerSet(address predicateManager)
```

Emitted when the predicate manager is set

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _predicateManager, string policyID) external
```

### permit

```solidity
function permit(address user, uint256 value, bytes encodedData, bytes permission) external returns (bool)
```

Validates if a user has the right to execute a specified action

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user attempting the action |
| value | uint256 | The msg.value of the transaction |
| encodedData | bytes | The encoded data of the action that user wants to execute |
| permission | bytes | The permission data that proves user authorization |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool |  |

### setPolicy

```solidity
function setPolicy(string policyID) external
```

Set the policy ID of Predicate

_Only the owner can call this function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| policyID | string | The policy ID to set |

### setPredicateManager

```solidity
function setPredicateManager(address serviceManager) external
```

Set the Predicate Manager

_Only the owner can call this function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceManager | address | The Predicate Manager address to set |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

## ClaimPlonkVerifier

### Verify

```solidity
function Verify(bytes proof, uint256[] public_inputs) public view returns (bool success)
```

Verify a Plonk proof.
Reverts if the proof or the public inputs are malformed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proof | bytes | serialised plonk proof (using gnark's MarshalSolidity) |
| public_inputs | uint256[] | (must be reduced) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| success | bool | true if the proof passes false otherwise |

## WithdrawalPlonkVerifier

### Verify

```solidity
function Verify(bytes proof, uint256[] public_inputs) public view returns (bool success)
```

Verify a Plonk proof.
Reverts if the proof or the public inputs are malformed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proof | bytes | serialised plonk proof (using gnark's MarshalSolidity) |
| public_inputs | uint256[] | (must be reduced) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| success | bool | true if the proof passes false otherwise |

## Contribution

### CONTRIBUTOR

```solidity
bytes32 CONTRIBUTOR
```

Role identifier for contracts that can record contributions

### startTimestamp

```solidity
uint256 startTimestamp
```

start timestamp of the contribution period

### periodInterval

```solidity
uint256 periodInterval
```

period interval

### totalContributions

```solidity
mapping(uint256 => mapping(bytes32 => uint256)) totalContributions
```

Maps periods and tags to total contributions

_period => tag => total contribution amount_

### userContributions

```solidity
mapping(uint256 => mapping(bytes32 => mapping(address => uint256))) userContributions
```

Maps periods, tags, and users to their individual contributions

_period => tag => user address => contribution amount_

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address admin, uint256 _periodInterval) external
```

### getCurrentPeriod

```solidity
function getCurrentPeriod() public view returns (uint256)
```

Gets the current period

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current period |

### recordContribution

```solidity
function recordContribution(bytes32 tag, address user, uint256 amount) external
```

Record a contribution for a specific tag and user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tag | bytes32 | The tag associated with the contribution. |
| user | address | The address of the user making the contribution. |
| amount | uint256 | The amount of contribution to record. |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
{upgradeToAndCall}.

Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.

```solidity
function _authorizeUpgrade(address) internal onlyOwner {}
```_

## BlockBuilderRegistry

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address admin) external
```

### emitHeartbeat

```solidity
function emitHeartbeat(string url) external
```

Emits a heartbeat for the block builder

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| url | string | The URL of the block builder |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

## IBlockBuilderRegistry

### BlockBuilderHeartbeat

```solidity
event BlockBuilderHeartbeat(address blockBuilder, string url)
```

Event emitted when a block builder is online

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockBuilder | address | The address of the updated block builder |
| url | string | The URL of the block builder |

### emitHeartbeat

```solidity
function emitHeartbeat(string url) external
```

Emits a heartbeat for the block builder

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| url | string | The URL of the block builder |

