# Solidity API

## BlockBuilderRegistry

Registry for block builders to signal their availability in the Intmax2 protocol

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address admin) external
```

Initializes the contract with an admin address

_Sets up the initial owner and initializes the upgradeable functionality_

#### Parameters

| Name  | Type    | Description                                       |
| ----- | ------- | ------------------------------------------------- |
| admin | address | The address that will have admin/owner privileges |

### emitHeartbeat

```solidity
function emitHeartbeat(string url) external
```

Allows a block builder to emit a heartbeat signaling they are online

_Emits a BlockBuilderHeartbeat event with the sender's address and provided URL_

#### Parameters

| Name | Type   | Description                                             |
| ---- | ------ | ------------------------------------------------------- |
| url  | string | The URL endpoint where the block builder can be reached |

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Authorizes an upgrade to the implementation

_Only callable by the owner_

#### Parameters

| Name              | Type    | Description                                                                 |
| ----------------- | ------- | --------------------------------------------------------------------------- |
| newImplementation | address | The address of the new implementation (unused but required by UUPS pattern) |

## IBlockBuilderRegistry

Interface for registering and tracking block builders in the Intmax2 protocol

_Block builders emit heartbeats to signal their availability and provide their URL_

### BlockBuilderHeartbeat

```solidity
event BlockBuilderHeartbeat(address blockBuilder, string url)
```

Event emitted when a block builder signals they are online

_Used to track active block builders and their endpoints_

#### Parameters

| Name         | Type    | Description                                             |
| ------------ | ------- | ------------------------------------------------------- |
| blockBuilder | address | The address of the block builder emitting the heartbeat |
| url          | string  | The URL endpoint where the block builder can be reached |

### emitHeartbeat

```solidity
function emitHeartbeat(string url) external
```

Allows a block builder to emit a heartbeat signaling they are online

_The sender's address is automatically recorded as the block builder address_

#### Parameters

| Name | Type   | Description                                             |
| ---- | ------ | ------------------------------------------------------- |
| url  | string | The URL endpoint where the block builder can be reached |

## Claim

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _scrollMessenger, address _claimVerifier, address _liquidity, address _rollup, address _contribution, uint256 periodInterval) external
```

Initializes the Claim contract

_Sets up the contract with required dependencies and initializes the allocation state_

#### Parameters

| Name              | Type    | Description                                         |
| ----------------- | ------- | --------------------------------------------------- |
| \_admin           | address | Address of the contract admin                       |
| \_scrollMessenger | address | Address of the Scroll Messenger contract            |
| \_claimVerifier   | address | Address of the claim proof verifier contract        |
| \_liquidity       | address | Address of the Liquidity contract                   |
| \_rollup          | address | Address of the Rollup contract                      |
| \_contribution    | address | Address of the Contribution contract                |
| periodInterval    | uint256 | Time interval between allocation periods in seconds |

### submitClaimProof

```solidity
function submitClaimProof(struct ChainedClaimLib.ChainedClaim[] claims, struct ClaimProofPublicInputsLib.ClaimProofPublicInputs publicInputs, bytes proof) external
```

Submit and verify claim proofs from intmax2

_Validates the claim proof, checks block hashes, and records contributions_

#### Parameters

| Name         | Type                                                    | Description                                    |
| ------------ | ------------------------------------------------------- | ---------------------------------------------- |
| claims       | struct ChainedClaimLib.ChainedClaim[]                   | Array of chained claims to be processed        |
| publicInputs | struct ClaimProofPublicInputsLib.ClaimProofPublicInputs | Public inputs for the claim proof verification |
| proof        | bytes                                                   | Zero-knowledge proof data                      |

### relayClaims

```solidity
function relayClaims(uint256 period, address[] users) external
```

Relay processed claims to the liquidity contract as withdrawals

_Creates withdrawal objects for each user's allocation and sends them to L1_

#### Parameters

| Name   | Type      | Description                                        |
| ------ | --------- | -------------------------------------------------- |
| period | uint256   | The allocation period to process                   |
| users  | address[] | Array of user addresses to process allocations for |

### getCurrentPeriod

```solidity
function getCurrentPeriod() external view returns (uint256)
```

Get the current period number

#### Return Values

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| [0]  | uint256 | The current period number |

### getAllocationInfo

```solidity
function getAllocationInfo(uint256 periodNumber, address user) external view returns (struct AllocationLib.AllocationInfo)
```

Get the allocation info for a user in a period

#### Parameters

| Name         | Type    | Description       |
| ------------ | ------- | ----------------- |
| periodNumber | uint256 | The period number |
| user         | address | The user address  |

#### Return Values

| Name | Type                                | Description         |
| ---- | ----------------------------------- | ------------------- |
| [0]  | struct AllocationLib.AllocationInfo | The allocation info |

### getAllocationConstants

```solidity
function getAllocationConstants() external view returns (struct AllocationLib.AllocationConstants)
```

Get the allocation constants

#### Return Values

| Name | Type                                     | Description              |
| ---- | ---------------------------------------- | ------------------------ |
| [0]  | struct AllocationLib.AllocationConstants | The allocation constants |

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Authorizes an upgrade to a new implementation

_Only the owner can authorize upgrades_

#### Parameters

| Name              | Type    | Description                       |
| ----------------- | ------- | --------------------------------- |
| newImplementation | address | Address of the new implementation |

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

| Name      | Type    | Description                 |
| --------- | ------- | --------------------------- |
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

| Name           | Type                            | Description                  |
| -------------- | ------------------------------- | ---------------------------- |
| withdrawalHash | bytes32                         | The hash of the withdrawal   |
| recipient      | address                         | The address of the recipient |
| withdrawal     | struct WithdrawalLib.Withdrawal | The withdrawal details       |

### submitClaimProof

```solidity
function submitClaimProof(struct ChainedClaimLib.ChainedClaim[] claims, struct ClaimProofPublicInputsLib.ClaimProofPublicInputs publicInputs, bytes proof) external
```

Submit claim proof from intmax2

#### Parameters

| Name         | Type                                                    | Description                       |
| ------------ | ------------------------------------------------------- | --------------------------------- |
| claims       | struct ChainedClaimLib.ChainedClaim[]                   | List of chained claims            |
| publicInputs | struct ClaimProofPublicInputsLib.ClaimProofPublicInputs | Public inputs for the claim proof |
| proof        | bytes                                                   | The proof data                    |

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

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| [0]  | uint256 | The current period number |

### getAllocationInfo

```solidity
function getAllocationInfo(uint256 periodNumber, address user) external view returns (struct AllocationLib.AllocationInfo)
```

Get the allocation info for a user in a period

#### Parameters

| Name         | Type    | Description       |
| ------------ | ------- | ----------------- |
| periodNumber | uint256 | The period number |
| user         | address | The user address  |

#### Return Values

| Name | Type                                | Description         |
| ---- | ----------------------------------- | ------------------- |
| [0]  | struct AllocationLib.AllocationInfo | The allocation info |

### getAllocationConstants

```solidity
function getAllocationConstants() external view returns (struct AllocationLib.AllocationConstants)
```

Get the allocation constants

#### Return Values

| Name | Type                                     | Description              |
| ---- | ---------------------------------------- | ------------------------ |
| [0]  | struct AllocationLib.AllocationConstants | The allocation constants |

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

Error emitted when an invalid deposit amount is provided

_Thrown when the deposit amount is not one of the allowed values_

### NotFinishedPeriod

```solidity
error NotFinishedPeriod()
```

Error emitted when an attempt is made to consume allocations for the current period

_Allocations can only be consumed for completed periods_

### periodIntervalZero

```solidity
error periodIntervalZero()
```

Error emitted when the period interval is zero

_Period interval must be greater than zero_

### ContributionRecorded

```solidity
event ContributionRecorded(uint256 period, address recipient, uint256 depositAmount, uint256 contribution)
```

Emitted when a contribution is recorded

#### Parameters

| Name          | Type    | Description             |
| ------------- | ------- | ----------------------- |
| period        | uint256 | current period          |
| recipient     | address | user address            |
| depositAmount | uint256 | deposit amount          |
| contribution  | uint256 | calculated contribution |

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

Initializes the allocation state with the given period interval

_Sets up the start timestamp aligned to period boundaries_

#### Parameters

| Name           | Type                       | Description                        |
| -------------- | -------------------------- | ---------------------------------- |
| state          | struct AllocationLib.State | The allocation state to initialize |
| periodInterval | uint256                    |                                    |

### recordContribution

```solidity
function recordContribution(struct AllocationLib.State state, address recipient, uint256 depositAmount) internal
```

Records a user's contribution for the current period

_Calculates contribution points based on deposit amount and updates state_

#### Parameters

| Name          | Type                       | Description                                            |
| ------------- | -------------------------- | ------------------------------------------------------ |
| state         | struct AllocationLib.State | The allocation state to update                         |
| recipient     | address                    | The address of the recipient who made the contribution |
| depositAmount | uint256                    | The amount of the deposit in wei                       |

### getUserAllocation

```solidity
function getUserAllocation(struct AllocationLib.State state, uint256 periodNumber, address user) internal view returns (uint256)
```

Gets the user's token allocation for a specific period

_Calculates the user's share of the period's total allocation based on their contribution_

#### Parameters

| Name         | Type                       | Description                              |
| ------------ | -------------------------- | ---------------------------------------- |
| state        | struct AllocationLib.State | The allocation state to query            |
| periodNumber | uint256                    | The period number to get allocation for  |
| user         | address                    | The user's address to get allocation for |

#### Return Values

| Name | Type    | Description                        |
| ---- | ------- | ---------------------------------- |
| [0]  | uint256 | The user's token allocation amount |

### consumeUserAllocation

```solidity
function consumeUserAllocation(struct AllocationLib.State state, uint256 periodNumber, address user) internal returns (uint256)
```

Consumes a user's allocation for a completed period

_Retrieves the user's allocation and resets their contribution to zero_

#### Parameters

| Name         | Type                       | Description                                  |
| ------------ | -------------------------- | -------------------------------------------- |
| state        | struct AllocationLib.State | The allocation state to update               |
| periodNumber | uint256                    | The period number to consume allocation for  |
| user         | address                    | The user's address to consume allocation for |

#### Return Values

| Name | Type    | Description                        |
| ---- | ------- | ---------------------------------- |
| [0]  | uint256 | The user's token allocation amount |

### getAllocationPerPeriod

```solidity
function getAllocationPerPeriod(struct AllocationLib.State state, uint256 periodNumber) internal view returns (uint256)
```

Gets the total token allocation for a specific period

_Calculates the allocation based on the reward schedule and period duration_

#### Parameters

| Name         | Type                       | Description                             |
| ------------ | -------------------------- | --------------------------------------- |
| state        | struct AllocationLib.State | The allocation state to query           |
| periodNumber | uint256                    | The period number to get allocation for |

#### Return Values

| Name | Type    | Description                               |
| ---- | ------- | ----------------------------------------- |
| [0]  | uint256 | The total token allocation for the period |

### calculateContribution

```solidity
function calculateContribution(uint256 amount) internal pure returns (uint256)
```

Calculates the contribution points for a deposit amount

_Maps specific deposit amounts to contribution point values_

#### Parameters

| Name   | Type    | Description               |
| ------ | ------- | ------------------------- |
| amount | uint256 | The deposit amount in wei |

#### Return Values

| Name | Type    | Description                        |
| ---- | ------- | ---------------------------------- |
| [0]  | uint256 | The calculated contribution points |

### getCurrentPeriod

```solidity
function getCurrentPeriod(struct AllocationLib.State state) internal view returns (uint256)
```

Gets the current period number based on the current timestamp

_Calculates the number of periods elapsed since the start timestamp_

#### Parameters

| Name  | Type                       | Description                   |
| ----- | -------------------------- | ----------------------------- |
| state | struct AllocationLib.State | The allocation state to query |

#### Return Values

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| [0]  | uint256 | The current period number |

### getAllocationInfo

```solidity
function getAllocationInfo(struct AllocationLib.State state, uint256 periodNumber, address user) internal view returns (struct AllocationLib.AllocationInfo)
```

Gets the allocation information for a user

_This function is not called by the contract,
so gas optimization is not necessary_

#### Parameters

| Name         | Type                       | Description          |
| ------------ | -------------------------- | -------------------- |
| state        | struct AllocationLib.State | The allocation state |
| periodNumber | uint256                    | The period number    |
| user         | address                    | The user's address   |

#### Return Values

| Name | Type                                | Description                |
| ---- | ----------------------------------- | -------------------------- |
| [0]  | struct AllocationLib.AllocationInfo | The allocation information |

### getAllocationConstants

```solidity
function getAllocationConstants(struct AllocationLib.State state) internal view returns (struct AllocationLib.AllocationConstants)
```

Gets the allocation constants

#### Parameters

| Name  | Type                       | Description          |
| ----- | -------------------------- | -------------------- |
| state | struct AllocationLib.State | The allocation state |

#### Return Values

| Name | Type                                     | Description              |
| ---- | ---------------------------------------- | ------------------------ |
| [0]  | struct AllocationLib.AllocationConstants | The allocation constants |

## ChainedClaimLib

Library for handling chained claims in a hash chain for claim verification

_Provides functionality to hash and verify chains of claims_

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

_Recalculates the hash chain and compares with the expected last hash_

#### Parameters

| Name          | Type                                  | Description                                      |
| ------------- | ------------------------------------- | ------------------------------------------------ |
| claims        | struct ChainedClaimLib.ChainedClaim[] | Array of ChainedClaims to verify                 |
| lastClaimHash | bytes32                               | The expected hash of the last claim in the chain |

#### Return Values

| Name | Type | Description                                      |
| ---- | ---- | ------------------------------------------------ |
| [0]  | bool | bool True if the chain is valid, false otherwise |

## ClaimProofPublicInputsLib

Library for handling public inputs for claim proofs

_Provides functionality to hash and verify claim proof public inputs_

### ClaimProofPublicInputs

Represents the public inputs for a claim proof verification

_Contains the last claim hash and the aggregator address_

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

Computes the hash of the ClaimProofPublicInputs for verification

_Used in the ZK proof verification process_

#### Parameters

| Name   | Type                                                    | Description                             |
| ------ | ------------------------------------------------------- | --------------------------------------- |
| inputs | struct ClaimProofPublicInputsLib.ClaimProofPublicInputs | The ClaimProofPublicInputs to be hashed |

#### Return Values

| Name | Type    | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| [0]  | bytes32 | bytes32 The resulting hash used for verification |

## Byte32Lib

Library for manipulating bytes32 values

_Provides utility functions for working with bytes32 data types_

### split

```solidity
function split(bytes32 input) internal pure returns (uint256[])
```

Splits a bytes32 value into an array of 8 uint256 values

_Each uint256 in the resulting array represents 4 bytes (32 bits) of the original input_

#### Parameters

| Name  | Type    | Description                   |
| ----- | ------- | ----------------------------- |
| input | bytes32 | The bytes32 value to be split |

#### Return Values

| Name | Type      | Description                                                          |
| ---- | --------- | -------------------------------------------------------------------- |
| [0]  | uint256[] | An array of 8 uint256 values, each representing 4 bytes of the input |

## DepositLib

Library for handling deposit operations and data structures

_Provides utilities for working with deposits in the Intmax2 protocol_

### Deposit

Represents a deposit in the Deposit tree

_This struct is used as a leaf in the Deposit Merkle tree_

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

_Uses keccak256 to hash the packed encoding of all deposit fields_

#### Parameters

| Name    | Type                      | Description                     |
| ------- | ------------------------- | ------------------------------- |
| deposit | struct DepositLib.Deposit | The Deposit struct to be hashed |

#### Return Values

| Name | Type    | Description                                                                    |
| ---- | ------- | ------------------------------------------------------------------------------ |
| [0]  | bytes32 | bytes32 The calculated hash of the Deposit, used as a leaf in the Deposit tree |

## IPlonkVerifier

Interface for verifying PLONK zero-knowledge proofs

_This interface is implemented by contracts that verify PLONK proofs generated using the gnark library_

### Verify

```solidity
function Verify(bytes proof, uint256[] publicInputs) external view returns (bool success)
```

Verify a PLONK zero-knowledge proof

_Reverts if the proof or the public inputs are malformed_

#### Parameters

| Name         | Type      | Description                                                   |
| ------------ | --------- | ------------------------------------------------------------- |
| proof        | bytes     | Serialized PLONK proof (using gnark's MarshalSolidity format) |
| publicInputs | uint256[] | Array of public inputs to the proof (must be in reduced form) |

#### Return Values

| Name    | Type | Description                                 |
| ------- | ---- | ------------------------------------------- |
| success | bool | True if the proof is valid, false otherwise |

## WithdrawalLib

Library for handling withdrawal operations and data structures

_Provides utilities for working with withdrawals in the Intmax2 protocol_

### Withdrawal

Represents a withdrawal operation in the Intmax2 protocol

_Contains all necessary information to process a withdrawal from L2 to L1_

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

_Uses keccak256 to hash the packed encoding of all withdrawal fields_

#### Parameters

| Name       | Type                            | Description                        |
| ---------- | ------------------------------- | ---------------------------------- |
| withdrawal | struct WithdrawalLib.Withdrawal | The Withdrawal struct to be hashed |

#### Return Values

| Name | Type    | Description                                                          |
| ---- | ------- | -------------------------------------------------------------------- |
| [0]  | bytes32 | bytes32 The calculated hash of the Withdrawal, used for verification |

## IContribution

Interface for the Contribution contract that tracks user contributions across different periods

_This interface defines the methods and events for recording and querying contributions_

### periodIntervalZero

```solidity
error periodIntervalZero()
```

Error thrown when attempting to initialize with a zero period interval

_This error is used to prevent invalid period configurations_

### ContributionRecorded

```solidity
event ContributionRecorded(uint256 periodNumber, bytes32 tag, address user, uint256 amount)
```

Emitted when a contribution is recorded

#### Parameters

| Name         | Type    | Description                                                        |
| ------------ | ------- | ------------------------------------------------------------------ |
| periodNumber | uint256 | The number of the period when the contribution was recorded        |
| tag          | bytes32 | The tag associated with the contribution (used for categorization) |
| user         | address | The address of the user making the contribution                    |
| amount       | uint256 | The amount of the contribution                                     |

### getCurrentPeriod

```solidity
function getCurrentPeriod() external view returns (uint256)
```

Gets the current period number based on the current timestamp

_Calculated as (current_timestamp - start_timestamp) / period_interval_

#### Return Values

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| [0]  | uint256 | The current period number |

### recordContribution

```solidity
function recordContribution(bytes32 tag, address user, uint256 amount) external
```

Records a contribution for a specific tag and user

_Can only be called by addresses with the CONTRIBUTOR role_

#### Parameters

| Name   | Type    | Description                                                        |
| ------ | ------- | ------------------------------------------------------------------ |
| tag    | bytes32 | The tag associated with the contribution (used for categorization) |
| user   | address | The address of the user making the contribution                    |
| amount | uint256 | The amount of contribution to record                               |

### totalContributions

```solidity
function totalContributions(uint256 period, bytes32 tag) external view returns (uint256)
```

Returns the total contribution for a specific tag in the specified period

_Aggregates all user contributions for the given tag and period_

#### Parameters

| Name   | Type    | Description                                                      |
| ------ | ------- | ---------------------------------------------------------------- |
| period | uint256 | The period number for which the contribution is being queried    |
| tag    | bytes32 | The tag (as bytes32) for which the contribution is being queried |

#### Return Values

| Name | Type    | Description                                                    |
| ---- | ------- | -------------------------------------------------------------- |
| [0]  | uint256 | The total contribution amount for the specified period and tag |

### userContributions

```solidity
function userContributions(uint256 period, bytes32 tag, address user) external view returns (uint256)
```

Returns the contribution of a specific user for a tag in the specified period

_Retrieves individual user contribution data_

#### Parameters

| Name   | Type    | Description                                                      |
| ------ | ------- | ---------------------------------------------------------------- |
| period | uint256 | The period number for which the contribution is being queried    |
| tag    | bytes32 | The tag (as bytes32) for which the contribution is being queried |
| user   | address | The address of the user whose contribution is being queried      |

#### Return Values

| Name | Type    | Description                                                     |
| ---- | ------- | --------------------------------------------------------------- |
| [0]  | uint256 | The contribution amount for the specified user, period, and tag |

## ILiquidity

Interface for the Liquidity contract that manages deposits and withdrawals of various token types
between Layer 1 and Layer 2 in the Intmax2 protocol

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

| Name            | Type    | Description                          |
| --------------- | ------- | ------------------------------------ |
| depositDataHash | bytes32 | The hash from the deposit data       |
| calculatedHash  | bytes32 | The hash calculated from given input |

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

| Name           | Type    | Description                                  |
| -------------- | ------- | -------------------------------------------- |
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

_Used to prevent duplicate deposits with the same parameters_

### DepositAmountExceedsLimit

```solidity
error DepositAmountExceedsLimit(uint256 depositAmount, uint256 limit)
```

Error thrown when the deposit amount exceeds the limit

#### Parameters

| Name          | Type    | Description                                   |
| ------------- | ------- | --------------------------------------------- |
| depositAmount | uint256 | The amount that was attempted to be deposited |
| limit         | uint256 | The maximum allowed deposit amount            |

### AmlValidationFailed

```solidity
error AmlValidationFailed()
```

Error thrown when AML validation fails

### EligibilityValidationFailed

```solidity
error EligibilityValidationFailed()
```

Error thrown when eligibility validation fails

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

| Name              | Type    | Description                                                                    |
| ----------------- | ------- | ------------------------------------------------------------------------------ |
| depositId         | uint256 | The unique identifier for the deposit                                          |
| sender            | address | The address that made the deposit                                              |
| recipientSaltHash | bytes32 | The hash of the recipient's intmax2 address (BLS public key) and a secret salt |
| tokenIndex        | uint32  | The index of the token being deposited                                         |
| amount            | uint256 | The amount of tokens deposited                                                 |
| isEligible        | bool    | if true, the deposit is eligible                                               |
| depositedAt       | uint256 | The timestamp of the deposit                                                   |

### DepositsRelayed

```solidity
event DepositsRelayed(uint256 upToDepositId, uint256 gasLimit, bytes message)
```

Event emitted when deposits are relayed

#### Parameters

| Name          | Type    | Description                             |
| ------------- | ------- | --------------------------------------- |
| upToDepositId | uint256 | The highest deposit ID that was relayed |
| gasLimit      | uint256 | The gas limit for the L2 transaction    |
| message       | bytes   | Additional message data                 |

### DepositCanceled

```solidity
event DepositCanceled(uint256 depositId)
```

Event emitted when a deposit is canceled

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| depositId | uint256 | The ID of the canceled deposit |

### WithdrawalClaimable

```solidity
event WithdrawalClaimable(bytes32 withdrawalHash)
```

Event emitted when a withdrawal becomes claimable

#### Parameters

| Name           | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| withdrawalHash | bytes32 | The hash of the claimable withdrawal |

### DirectWithdrawalSuccessed

```solidity
event DirectWithdrawalSuccessed(bytes32 withdrawalHash, address recipient)
```

Event emitted when a direct withdrawal succeeds

#### Parameters

| Name           | Type    | Description                              |
| -------------- | ------- | ---------------------------------------- |
| withdrawalHash | bytes32 | The hash of the successful withdrawal    |
| recipient      | address | The address that received the withdrawal |

### DirectWithdrawalFailed

```solidity
event DirectWithdrawalFailed(bytes32 withdrawalHash, struct WithdrawalLib.Withdrawal withdrawal)
```

Event emitted when a direct withdrawal fails, and the funds become claimable

#### Parameters

| Name           | Type                            | Description                       |
| -------------- | ------------------------------- | --------------------------------- |
| withdrawalHash | bytes32                         | The hash of the failed withdrawal |
| withdrawal     | struct WithdrawalLib.Withdrawal | The withdrawal data               |

### ClaimedWithdrawal

```solidity
event ClaimedWithdrawal(address recipient, bytes32 withdrawalHash)
```

Event emitted when a withdrawal is claimed

#### Parameters

| Name           | Type    | Description                             |
| -------------- | ------- | --------------------------------------- |
| recipient      | address | The address that claimed the withdrawal |
| withdrawalHash | bytes32 | The hash of the claimed withdrawal      |

### WithdrawalFeeCollected

```solidity
event WithdrawalFeeCollected(uint32 token, uint256 amount)
```

Event emitted when withdrawal fee is collected

#### Parameters

| Name   | Type    | Description                    |
| ------ | ------- | ------------------------------ |
| token  | uint32  | The index of the token         |
| amount | uint256 | The amount of tokens collected |

### WithdrawalFeeWithdrawn

```solidity
event WithdrawalFeeWithdrawn(address recipient, uint32 token, uint256 amount)
```

Event emitted when withdrawal fee are withdrawn

#### Parameters

| Name      | Type    | Description                       |
| --------- | ------- | --------------------------------- |
| recipient | address | The address that claimed the fees |
| token     | uint32  | The index of the token            |
| amount    | uint256 | The amount of tokens claimed      |

### PermitterSet

```solidity
event PermitterSet(address amlPermitter, address eligibilityPermitter)
```

Event emitted when permitter addresses are set

#### Parameters

| Name                 | Type    | Description                                       |
| -------------------- | ------- | ------------------------------------------------- |
| amlPermitter         | address | The address of the AML permitter contract         |
| eligibilityPermitter | address | The address of the eligibility permitter contract |

### WithdrawalFeeRatioSet

```solidity
event WithdrawalFeeRatioSet(uint32 tokenIndex, uint256 feeRatio)
```

Event emitted when the withdrawal fee ratio is set

#### Parameters

| Name       | Type    | Description                                              |
| ---------- | ------- | -------------------------------------------------------- |
| tokenIndex | uint32  | The index of the token                                   |
| feeRatio   | uint256 | The withdrawal fee ratio for the token (in basis points) |

### pauseDeposits

```solidity
function pauseDeposits() external
```

Pauses all deposit operations

_Only callable by the admin role_

### unpauseDeposits

```solidity
function unpauseDeposits() external
```

Unpauses all deposit operations

_Only callable by the admin role_

### setPermitter

```solidity
function setPermitter(address _amlPermitter, address _eligibilityPermitter) external
```

Sets the AML and eligibility permitter contract addresses

_Only callable by the admin role_

#### Parameters

| Name                   | Type    | Description                                       |
| ---------------------- | ------- | ------------------------------------------------- |
| \_amlPermitter         | address | The address of the AML permitter contract         |
| \_eligibilityPermitter | address | The address of the eligibility permitter contract |

### setWithdrawalFeeRatio

```solidity
function setWithdrawalFeeRatio(uint32 tokenIndex, uint256 feeRatio) external
```

Sets the withdrawal fee ratio for a specific token

_Only callable by the admin role. Fee ratio is in basis points (1bp = 0.01%)_

#### Parameters

| Name       | Type    | Description                                            |
| ---------- | ------- | ------------------------------------------------------ |
| tokenIndex | uint32  | The index of the token to set the fee ratio for        |
| feeRatio   | uint256 | The fee ratio to set (in basis points, max 1500 = 15%) |

### withdrawCollectedFees

```solidity
function withdrawCollectedFees(address recipient, uint32[] tokenIndices) external
```

Withdraws collected fees for specified tokens to a recipient address

_Only callable by the admin role. Skips tokens with zero fees_

#### Parameters

| Name         | Type     | Description                                 |
| ------------ | -------- | ------------------------------------------- |
| recipient    | address  | The address to receive the withdrawn fees   |
| tokenIndices | uint32[] | Array of token indices to withdraw fees for |

### depositNativeToken

```solidity
function depositNativeToken(bytes32 recipientSaltHash, bytes amlPermission, bytes eligibilityPermission) external payable
```

Deposit native token (ETH) to Intmax

_The deposit amount is taken from msg.value, recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name                  | Type    | Description                                                   |
| --------------------- | ------- | ------------------------------------------------------------- |
| recipientSaltHash     | bytes32 | The hash of the recipient's intmax2 address and a secret salt |
| amlPermission         | bytes   | The data to verify AML check                                  |
| eligibilityPermission | bytes   | The data to verify eligibility check                          |

### depositERC20

```solidity
function depositERC20(address tokenAddress, bytes32 recipientSaltHash, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC20 token to Intmax

_Requires prior approval for this contract to spend the tokens
recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name                  | Type    | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| tokenAddress          | address | The address of the ERC20 token contract               |
| recipientSaltHash     | bytes32 | The hash of the recipient's address and a secret salt |
| amount                | uint256 | The amount of tokens to deposit                       |
| amlPermission         | bytes   | The data to verify AML check                          |
| eligibilityPermission | bytes   | The data to verify eligibility check                  |

### depositERC721

```solidity
function depositERC721(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit an ERC721 token to Intmax

_Requires prior approval for this contract to transfer the token_

#### Parameters

| Name                  | Type    | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| tokenAddress          | address | The address of the ERC721 token contract              |
| recipientSaltHash     | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId               | uint256 | The ID of the token to deposit                        |
| amlPermission         | bytes   | The data to verify AML check                          |
| eligibilityPermission | bytes   | The data to verify eligibility check                  |

### depositERC1155

```solidity
function depositERC1155(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC1155 tokens to Intmax

_Requires prior approval for this contract to transfer the tokens_

#### Parameters

| Name                  | Type    | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| tokenAddress          | address | The address of the ERC1155 token contract             |
| recipientSaltHash     | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId               | uint256 | The ID of the token to deposit                        |
| amount                | uint256 | The amount of tokens to deposit                       |
| amlPermission         | bytes   | The data to verify AML check                          |
| eligibilityPermission | bytes   | The data to verify eligibility check                  |

### relayDeposits

```solidity
function relayDeposits(uint256 upToDepositId, uint256 gasLimit) external payable
```

Relays deposits from Layer 1 to Intmax

_Only callable by addresses with the RELAYER role. The msg.value is used to pay for the L2 gas_

#### Parameters

| Name          | Type    | Description                                            |
| ------------- | ------- | ------------------------------------------------------ |
| upToDepositId | uint256 | The upper limit of the Deposit ID that will be relayed |
| gasLimit      | uint256 | The gas limit for the L2 transaction                   |

### cancelDeposit

```solidity
function cancelDeposit(uint256 depositId, struct DepositLib.Deposit deposit) external
```

Cancels a deposit that hasn't been relayed yet

_Only the original sender can cancel their deposit, and only if it hasn't been relayed_

#### Parameters

| Name      | Type                      | Description                                                        |
| --------- | ------------------------- | ------------------------------------------------------------------ |
| depositId | uint256                   | The ID of the deposit to cancel                                    |
| deposit   | struct DepositLib.Deposit | The deposit data structure containing the original deposit details |

### processWithdrawals

```solidity
function processWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals, bytes32[] withdrawalHashes) external
```

Processes withdrawals from Layer 2 to Layer 1

_Only callable by addresses with the WITHDRAWAL role through the L1ScrollMessenger_

#### Parameters

| Name             | Type                              | Description                                                                  |
| ---------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| withdrawals      | struct WithdrawalLib.Withdrawal[] | Array of direct withdrawals to process immediately                           |
| withdrawalHashes | bytes32[]                         | Array of withdrawal hashes to mark as claimable (for non-direct withdrawals) |

### getLastRelayedDepositId

```solidity
function getLastRelayedDepositId() external view returns (uint256)
```

Get the ID of the last deposit relayed to Layer 2

_This ID represents the highest deposit that has been successfully relayed_

#### Return Values

| Name | Type    | Description                        |
| ---- | ------- | ---------------------------------- |
| [0]  | uint256 | The ID of the last relayed deposit |

### getLastDepositId

```solidity
function getLastDepositId() external view returns (uint256)
```

Get the ID of the last deposit made to Layer 2

_This ID represents the highest deposit that has been created, whether relayed or not_

#### Return Values

| Name | Type    | Description                |
| ---- | ------- | -------------------------- |
| [0]  | uint256 | The ID of the last deposit |

### getDepositData

```solidity
function getDepositData(uint256 depositId) external view returns (struct DepositQueueLib.DepositData)
```

Get deposit data for a given deposit ID

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| depositId | uint256 | The ID of the deposit to query |

#### Return Values

| Name | Type                               | Description                                                   |
| ---- | ---------------------------------- | ------------------------------------------------------------- |
| [0]  | struct DepositQueueLib.DepositData | The deposit data structure containing sender and deposit hash |

### getDepositDataBatch

```solidity
function getDepositDataBatch(uint256[] depositIds) external view returns (struct DepositQueueLib.DepositData[])
```

Get deposit data for multiple deposit IDs in a single call

#### Parameters

| Name       | Type      | Description                   |
| ---------- | --------- | ----------------------------- |
| depositIds | uint256[] | Array of deposit IDs to query |

#### Return Values

| Name | Type                                 | Description                                                         |
| ---- | ------------------------------------ | ------------------------------------------------------------------- |
| [0]  | struct DepositQueueLib.DepositData[] | Array of deposit data structures corresponding to the requested IDs |

### getDepositDataHash

```solidity
function getDepositDataHash(uint256 depositId) external view returns (bytes32)
```

Get the deposit hash for a given deposit ID

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| depositId | uint256 | The ID of the deposit to query |

#### Return Values

| Name | Type    | Description                  |
| ---- | ------- | ---------------------------- |
| [0]  | bytes32 | The hash of the deposit data |

### claimWithdrawals

```solidity
function claimWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals) external
```

Claim withdrawals for tokens that couldn't be processed through direct withdrawals

_Used for ERC721, ERC1155, or failed direct withdrawals of native/ERC20 tokens_

#### Parameters

| Name        | Type                              | Description                   |
| ----------- | --------------------------------- | ----------------------------- |
| withdrawals | struct WithdrawalLib.Withdrawal[] | Array of withdrawals to claim |

### isDepositValid

```solidity
function isDepositValid(uint256 depositId, bytes32 recipientSaltHash, uint32 tokenIndex, uint256 amount, bool isEligible, address sender) external view returns (bool)
```

Check if a deposit is valid by comparing its parameters with stored data

#### Parameters

| Name              | Type    | Description                                                   |
| ----------------- | ------- | ------------------------------------------------------------- |
| depositId         | uint256 | The ID of the deposit to validate                             |
| recipientSaltHash | bytes32 | The hash of the recipient's intmax2 address and a secret salt |
| tokenIndex        | uint32  | The index of the token being deposited                        |
| amount            | uint256 | The amount of tokens deposited                                |
| isEligible        | bool    | Whether the deposit is eligible for mining rewards            |
| sender            | address | The address that made the deposit                             |

#### Return Values

| Name | Type | Description                                   |
| ---- | ---- | --------------------------------------------- |
| [0]  | bool | True if the deposit is valid, false otherwise |

### onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) external pure returns (bytes4)
```

ERC1155 token receiver function required for this contract to receive ERC1155 tokens

_Implements the IERC1155Receiver interface_

#### Return Values

| Name | Type   | Description                                                                  |
| ---- | ------ | ---------------------------------------------------------------------------- |
| [0]  | bytes4 | bytes4 The function selector to indicate support for ERC1155 token receiving |

## ITokenData

Interface for managing token information and indices in the Intmax2 protocol

_Provides functions to store, retrieve, and manage different token types (Native, ERC20, ERC721, ERC1155)_

### TokenAddressIsZero

```solidity
error TokenAddressIsZero()
```

Error thrown when attempting to use a zero address for a non-native token

_Native tokens use address(0), but other token types must have a valid contract address_

### TokenType

Enum representing different token types supported by the protocol

_Used to determine how to handle each token type during deposits and withdrawals_

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

_Used to store all necessary information to identify and handle a token_

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

_Token indices are assigned sequentially as new tokens are added to the system_

#### Parameters

| Name       | Type   | Description                                        |
| ---------- | ------ | -------------------------------------------------- |
| tokenIndex | uint32 | The index of the token to retrieve information for |

#### Return Values

| Name | Type                        | Description                                                   |
| ---- | --------------------------- | ------------------------------------------------------------- |
| [0]  | struct ITokenData.TokenInfo | TokenInfo struct containing the token's type, address, and ID |

### getTokenIndex

```solidity
function getTokenIndex(enum ITokenData.TokenType tokenType, address tokenAddress, uint256 tokenId) external view returns (bool, uint32)
```

Retrieves the token index for given token parameters

_Used to look up a token's index based on its identifying information_

#### Parameters

| Name         | Type                      | Description                                                                     |
| ------------ | ------------------------- | ------------------------------------------------------------------------------- |
| tokenType    | enum ITokenData.TokenType | The type of the token (NATIVE, ERC20, ERC721, ERC1155)                          |
| tokenAddress | address                   | The address of the token contract (zero address for native tokens)              |
| tokenId      | uint256                   | The ID of the token (used for ERC721 and ERC1155, ignored for NATIVE and ERC20) |

#### Return Values

| Name | Type   | Description                                                             |
| ---- | ------ | ----------------------------------------------------------------------- |
| [0]  | bool   | bool Indicating whether the token index was found (true) or not (false) |
| [1]  | uint32 | uint32 The index of the token if found, 0 if not found                  |

### getNativeTokenIndex

```solidity
function getNativeTokenIndex() external view returns (uint32)
```

Retrieves the index of the native token (ETH)

_The native token is always at index 0 in the system_

#### Return Values

| Name | Type   | Description                                     |
| ---- | ------ | ----------------------------------------------- |
| [0]  | uint32 | uint32 The index of the native token (always 0) |

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

Withdrawal fee ratio limit

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

Mapping of withdrawal hashes to their timestamp when they became claimable

_A value of 0 means the withdrawal is not claimable_

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

_Used to track fees that can be withdrawn by the admin_

### onlyWithdrawalRole

```solidity
modifier onlyWithdrawalRole()
```

Modifier to restrict access to only the withdrawal role through the L1ScrollMessenger

_Ensures the function is called via the L1ScrollMessenger and the cross-domain sender has the WITHDRAWAL role_

### canCancelDeposit

```solidity
modifier canCancelDeposit(uint256 depositId, struct DepositLib.Deposit deposit)
```

Modifier to check if a deposit can be canceled

_Verifies the caller is the original sender, the deposit hash matches, and the deposit hasn't been relayed_

#### Parameters

| Name      | Type                      | Description                     |
| --------- | ------------------------- | ------------------------------- |
| depositId | uint256                   | The ID of the deposit to cancel |
| deposit   | struct DepositLib.Deposit | The deposit data structure      |

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

| Name                | Type      | Description                                      |
| ------------------- | --------- | ------------------------------------------------ |
| \_admin             | address   | The address that will have admin privileges      |
| \_l1ScrollMessenger | address   | The address of the L1ScrollMessenger contract    |
| \_rollup            | address   | The address of the Rollup contract               |
| \_withdrawal        | address   | The address that will have withdrawal privileges |
| \_claim             | address   | The address that will have claim privileges      |
| \_relayer           | address   | The address that will have relayer privileges    |
| \_contribution      | address   | The address of the Contribution contract         |
| initialERC20Tokens  | address[] | Initial list of ERC20 token addresses to support |

### setPermitter

```solidity
function setPermitter(address _amlPermitter, address _eligibilityPermitter) external
```

Sets the AML and eligibility permitter contract addresses

_Only callable by the admin role_

#### Parameters

| Name                   | Type    | Description                                       |
| ---------------------- | ------- | ------------------------------------------------- |
| \_amlPermitter         | address | The address of the AML permitter contract         |
| \_eligibilityPermitter | address | The address of the eligibility permitter contract |

### setWithdrawalFeeRatio

```solidity
function setWithdrawalFeeRatio(uint32 tokenIndex, uint256 feeRatio) external
```

Sets the withdrawal fee ratio for a specific token

_Only callable by the admin role. Fee ratio is in basis points (1bp = 0.01%)_

#### Parameters

| Name       | Type    | Description                                            |
| ---------- | ------- | ------------------------------------------------------ |
| tokenIndex | uint32  | The index of the token to set the fee ratio for        |
| feeRatio   | uint256 | The fee ratio to set (in basis points, max 1500 = 15%) |

### withdrawCollectedFees

```solidity
function withdrawCollectedFees(address recipient, uint32[] tokenIndices) external
```

Withdraws collected fees for specified tokens to a recipient address

_Only callable by the admin role. Skips tokens with zero fees_

#### Parameters

| Name         | Type     | Description                                 |
| ------------ | -------- | ------------------------------------------- |
| recipient    | address  | The address to receive the withdrawn fees   |
| tokenIndices | uint32[] | Array of token indices to withdraw fees for |

### pauseDeposits

```solidity
function pauseDeposits() external
```

Pauses all deposit operations

_Only callable by the admin role_

### unpauseDeposits

```solidity
function unpauseDeposits() external
```

Unpauses all deposit operations

_Only callable by the admin role_

### depositNativeToken

```solidity
function depositNativeToken(bytes32 recipientSaltHash, bytes amlPermission, bytes eligibilityPermission) external payable
```

Deposit native token (ETH) to Intmax

_The deposit amount is taken from msg.value, recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name                  | Type    | Description                                                   |
| --------------------- | ------- | ------------------------------------------------------------- |
| recipientSaltHash     | bytes32 | The hash of the recipient's intmax2 address and a secret salt |
| amlPermission         | bytes   | The data to verify AML check                                  |
| eligibilityPermission | bytes   | The data to verify eligibility check                          |

### depositERC20

```solidity
function depositERC20(address tokenAddress, bytes32 recipientSaltHash, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC20 token to Intmax

_Requires prior approval for this contract to spend the tokens
recipientSaltHash is the Poseidon hash of the intmax2 address (32 bytes) and a secret salt_

#### Parameters

| Name                  | Type    | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| tokenAddress          | address | The address of the ERC20 token contract               |
| recipientSaltHash     | bytes32 | The hash of the recipient's address and a secret salt |
| amount                | uint256 | The amount of tokens to deposit                       |
| amlPermission         | bytes   | The data to verify AML check                          |
| eligibilityPermission | bytes   | The data to verify eligibility check                  |

### depositERC721

```solidity
function depositERC721(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit an ERC721 token to Intmax

_Requires prior approval for this contract to transfer the token_

#### Parameters

| Name                  | Type    | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| tokenAddress          | address | The address of the ERC721 token contract              |
| recipientSaltHash     | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId               | uint256 | The ID of the token to deposit                        |
| amlPermission         | bytes   | The data to verify AML check                          |
| eligibilityPermission | bytes   | The data to verify eligibility check                  |

### depositERC1155

```solidity
function depositERC1155(address tokenAddress, bytes32 recipientSaltHash, uint256 tokenId, uint256 amount, bytes amlPermission, bytes eligibilityPermission) external
```

Deposit a specified amount of ERC1155 tokens to Intmax

_Requires prior approval for this contract to transfer the tokens_

#### Parameters

| Name                  | Type    | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| tokenAddress          | address | The address of the ERC1155 token contract             |
| recipientSaltHash     | bytes32 | The hash of the recipient's address and a secret salt |
| tokenId               | uint256 | The ID of the token to deposit                        |
| amount                | uint256 | The amount of tokens to deposit                       |
| amlPermission         | bytes   | The data to verify AML check                          |
| eligibilityPermission | bytes   | The data to verify eligibility check                  |

### relayDeposits

```solidity
function relayDeposits(uint256 upToDepositId, uint256 gasLimit) external payable
```

Relays deposits from Layer 1 to Intmax

_Only callable by addresses with the RELAYER role. The msg.value is used to pay for the L2 gas_

#### Parameters

| Name          | Type    | Description                                            |
| ------------- | ------- | ------------------------------------------------------ |
| upToDepositId | uint256 | The upper limit of the Deposit ID that will be relayed |
| gasLimit      | uint256 | The gas limit for the L2 transaction                   |

### claimWithdrawals

```solidity
function claimWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals) external
```

Claim withdrawals for tokens that couldn't be processed through direct withdrawals

_Used for ERC721, ERC1155, or failed direct withdrawals of native/ERC20 tokens_

#### Parameters

| Name        | Type                              | Description                   |
| ----------- | --------------------------------- | ----------------------------- |
| withdrawals | struct WithdrawalLib.Withdrawal[] | Array of withdrawals to claim |

### cancelDeposit

```solidity
function cancelDeposit(uint256 depositId, struct DepositLib.Deposit deposit) external
```

Cancels a deposit that hasn't been relayed yet

_Only the original sender can cancel their deposit, and only if it hasn't been relayed_

#### Parameters

| Name      | Type                      | Description                                                        |
| --------- | ------------------------- | ------------------------------------------------------------------ |
| depositId | uint256                   | The ID of the deposit to cancel                                    |
| deposit   | struct DepositLib.Deposit | The deposit data structure containing the original deposit details |

### processWithdrawals

```solidity
function processWithdrawals(struct WithdrawalLib.Withdrawal[] withdrawals, bytes32[] withdrawalHashes) external
```

Processes both direct withdrawals and claimable withdrawals

_Only callable by addresses with the WITHDRAWAL role through the L1ScrollMessenger_

#### Parameters

| Name             | Type                              | Description                                     |
| ---------------- | --------------------------------- | ----------------------------------------------- |
| withdrawals      | struct WithdrawalLib.Withdrawal[] | Array of direct withdrawals to process          |
| withdrawalHashes | bytes32[]                         | Array of withdrawal hashes to mark as claimable |

### \_processDirectWithdrawal

```solidity
function _processDirectWithdrawal(struct WithdrawalLib.Withdrawal withdrawal_) internal
```

Processes a single direct withdrawal

_Attempts to send tokens directly to the recipient, collects fees, and handles failures_

#### Parameters

| Name         | Type                            | Description               |
| ------------ | ------------------------------- | ------------------------- |
| withdrawal\_ | struct WithdrawalLib.Withdrawal | The withdrawal to process |

### onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) external pure returns (bytes4)
```

ERC1155 token receiver function required for this contract to receive ERC1155 tokens

_Implements the IERC1155Receiver interface_

#### Return Values

| Name | Type   | Description                                                                  |
| ---- | ------ | ---------------------------------------------------------------------------- |
| [0]  | bytes4 | bytes4 The function selector to indicate support for ERC1155 token receiving |

### isDepositValid

```solidity
function isDepositValid(uint256 depositId, bytes32 recipientSaltHash, uint32 tokenIndex, uint256 amount, bool isEligible, address sender) external view returns (bool)
```

Check if a deposit is valid by comparing its parameters with stored data

#### Parameters

| Name              | Type    | Description                                                   |
| ----------------- | ------- | ------------------------------------------------------------- |
| depositId         | uint256 | The ID of the deposit to validate                             |
| recipientSaltHash | bytes32 | The hash of the recipient's intmax2 address and a secret salt |
| tokenIndex        | uint32  | The index of the token being deposited                        |
| amount            | uint256 | The amount of tokens deposited                                |
| isEligible        | bool    | Whether the deposit is eligible for mining rewards            |
| sender            | address | The address that made the deposit                             |

#### Return Values

| Name | Type | Description                                   |
| ---- | ---- | --------------------------------------------- |
| [0]  | bool | True if the deposit is valid, false otherwise |

### getDepositData

```solidity
function getDepositData(uint256 depositId) external view returns (struct DepositQueueLib.DepositData)
```

Get deposit data for a given deposit ID

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| depositId | uint256 | The ID of the deposit to query |

#### Return Values

| Name | Type                               | Description                                                   |
| ---- | ---------------------------------- | ------------------------------------------------------------- |
| [0]  | struct DepositQueueLib.DepositData | The deposit data structure containing sender and deposit hash |

### getDepositDataBatch

```solidity
function getDepositDataBatch(uint256[] depositIds) external view returns (struct DepositQueueLib.DepositData[])
```

Get deposit data for multiple deposit IDs in a single call

#### Parameters

| Name       | Type      | Description                   |
| ---------- | --------- | ----------------------------- |
| depositIds | uint256[] | Array of deposit IDs to query |

#### Return Values

| Name | Type                                 | Description                                                         |
| ---- | ------------------------------------ | ------------------------------------------------------------------- |
| [0]  | struct DepositQueueLib.DepositData[] | Array of deposit data structures corresponding to the requested IDs |

### getDepositDataHash

```solidity
function getDepositDataHash(uint256 depositId) external view returns (bytes32)
```

Get the deposit hash for a given deposit ID

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| depositId | uint256 | The ID of the deposit to query |

#### Return Values

| Name | Type    | Description                  |
| ---- | ------- | ---------------------------- |
| [0]  | bytes32 | The hash of the deposit data |

### getLastRelayedDepositId

```solidity
function getLastRelayedDepositId() public view returns (uint256)
```

Get the ID of the last deposit relayed to Layer 2

_This ID represents the highest deposit that has been successfully relayed_

#### Return Values

| Name | Type    | Description                        |
| ---- | ------- | ---------------------------------- |
| [0]  | uint256 | The ID of the last relayed deposit |

### getLastDepositId

```solidity
function getLastDepositId() external view returns (uint256)
```

Get the ID of the last deposit made to Layer 2

_This ID represents the highest deposit that has been created, whether relayed or not_

#### Return Values

| Name | Type    | Description                |
| ---- | ------- | -------------------------- |
| [0]  | uint256 | The ID of the last deposit |

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Authorizes an upgrade to the implementation

_Only callable by the admin role_

#### Parameters

| Name              | Type    | Description                           |
| ----------------- | ------- | ------------------------------------- |
| newImplementation | address | The address of the new implementation |

## TokenData

Abstract contract for managing token information and indices in the Intmax2 protocol

_Implements the ITokenData interface and provides storage and functionality for tracking
different token types (Native, ERC20, ERC721, ERC1155)_

### \_\_TokenData_init

```solidity
function __TokenData_init(address[] initialERC20Tokens) internal
```

Initializes the TokenData contract with native token and initial ERC20 tokens

_Called during contract initialization to set up the token indices_

#### Parameters

| Name               | Type      | Description                                       |
| ------------------ | --------- | ------------------------------------------------- |
| initialERC20Tokens | address[] | Array of ERC20 token addresses to initialize with |

### \_getOrCreateTokenIndex

```solidity
function _getOrCreateTokenIndex(enum ITokenData.TokenType tokenType, address tokenAddress, uint256 tokenId) internal returns (uint32)
```

Gets the token index for a token, creating a new index if it doesn't exist

_Used during deposit operations to ensure all tokens have an index_

#### Parameters

| Name         | Type                      | Description                                                        |
| ------------ | ------------------------- | ------------------------------------------------------------------ |
| tokenType    | enum ITokenData.TokenType | The type of the token (NATIVE, ERC20, ERC721, ERC1155)             |
| tokenAddress | address                   | The address of the token contract (zero address for native tokens) |
| tokenId      | uint256                   | The ID of the token (used for ERC721 and ERC1155)                  |

#### Return Values

| Name | Type   | Description                                                      |
| ---- | ------ | ---------------------------------------------------------------- |
| [0]  | uint32 | uint32 The index of the token (either existing or newly created) |

### getNativeTokenIndex

```solidity
function getNativeTokenIndex() public pure returns (uint32)
```

Retrieves the index of the native token (ETH)

_The native token is always at index 0 in the system_

#### Return Values

| Name | Type   | Description                                     |
| ---- | ------ | ----------------------------------------------- |
| [0]  | uint32 | uint32 The index of the native token (always 0) |

### getTokenIndex

```solidity
function getTokenIndex(enum ITokenData.TokenType tokenType, address tokenAddress, uint256 tokenId) public view returns (bool, uint32)
```

Retrieves the token index for given token parameters

_Checks the appropriate mapping based on token type_

#### Parameters

| Name         | Type                      | Description                                                        |
| ------------ | ------------------------- | ------------------------------------------------------------------ |
| tokenType    | enum ITokenData.TokenType | The type of the token (NATIVE, ERC20, ERC721, ERC1155)             |
| tokenAddress | address                   | The address of the token contract (zero address for native tokens) |
| tokenId      | uint256                   | The ID of the token (used for ERC721 and ERC1155)                  |

#### Return Values

| Name | Type   | Description                                                             |
| ---- | ------ | ----------------------------------------------------------------------- |
| [0]  | bool   | bool Indicating whether the token index was found (true) or not (false) |
| [1]  | uint32 | uint32 The index of the token if found, 0 if not found                  |

### getTokenInfo

```solidity
function getTokenInfo(uint32 tokenIndex) public view returns (struct ITokenData.TokenInfo)
```

Retrieves token information for a given token index

_Returns the TokenInfo struct from the tokenInfoList array_

#### Parameters

| Name       | Type   | Description                                        |
| ---------- | ------ | -------------------------------------------------- |
| tokenIndex | uint32 | The index of the token to retrieve information for |

#### Return Values

| Name | Type                        | Description                                                   |
| ---- | --------------------------- | ------------------------------------------------------------- |
| [0]  | struct ITokenData.TokenInfo | TokenInfo struct containing the token's type, address, and ID |

## DepositLimit

A library for managing deposit limits for different tokens over time

_Implements a time-based deposit limit system that increases limits for specific tokens
as time passes from the deployment date_

### ETH_INDEX

```solidity
uint8 ETH_INDEX
```

Token index constants for supported tokens

_These indices must match the indices used in the TokenData contract_

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

Time period constants in days from deployment

_Used to determine which deposit limit applies based on elapsed time_

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

ETH deposit limits for different time periods

_Values in wei (1 ether = 10^18 wei)_

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

WBTC deposit limits for different time periods

_Values in satoshi (1 BTC = 10^8 satoshi)_

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

USDC deposit limits for different time periods

_Values in USDC atomic units (1 USDC = 10^6 units)_

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

Returns the current deposit limit for a token based on time elapsed since deployment

_For tokens other than ETH, WBTC, and USDC, returns the maximum possible uint256 value_

#### Parameters

| Name           | Type    | Description                                                               |
| -------------- | ------- | ------------------------------------------------------------------------- |
| tokenIndex     | uint32  | The index of the token to get the deposit limit for                       |
| deploymentTime | uint256 | The timestamp when the contract was deployed (used as the starting point) |

#### Return Values

| Name  | Type    | Description                                       |
| ----- | ------- | ------------------------------------------------- |
| limit | uint256 | The current deposit limit for the specified token |

## DepositQueueLib

A library for managing a queue of pending deposits in the Liquidity contract

_Implements a queue data structure with enqueue, dequeue, and delete operations
to track deposits that are waiting to be relayed to Layer 2_

### OutOfRange

```solidity
error OutOfRange(uint256 upToDepositId, uint256 firstDepositId, uint256 lastDepositId)
```

Error thrown when trying to relay deposits outside the valid queue range

#### Parameters

| Name           | Type    | Description                                   |
| -------------- | ------- | --------------------------------------------- |
| upToDepositId  | uint256 | The requested deposit ID that is out of range |
| firstDepositId | uint256 | The first valid deposit ID in the queue       |
| lastDepositId  | uint256 | The last valid deposit ID in the queue        |

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

_Stores minimal information needed to track and validate deposits_

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

_Pushes a dummy element to make the queue 1-indexed for easier tracking_

#### Parameters

| Name         | Type                                | Description                                                    |
| ------------ | ----------------------------------- | -------------------------------------------------------------- |
| depositQueue | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct to initialize |

### enqueue

```solidity
function enqueue(struct DepositQueueLib.DepositQueue depositQueue, bytes32 depositHash, address sender) internal returns (uint256 depositId)
```

Adds a new deposit to the queue

_The deposit ID is the index in the depositData array_

#### Parameters

| Name         | Type                                | Description                                      |
| ------------ | ----------------------------------- | ------------------------------------------------ |
| depositQueue | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct |
| depositHash  | bytes32                             | The hash of the deposit data                     |
| sender       | address                             | The address of the depositor                     |

#### Return Values

| Name      | Type    | Description                                                            |
| --------- | ------- | ---------------------------------------------------------------------- |
| depositId | uint256 | The ID of the newly added deposit (used for tracking and cancellation) |

### deleteDeposit

```solidity
function deleteDeposit(struct DepositQueueLib.DepositQueue depositQueue, uint256 depositId) internal returns (struct DepositQueueLib.DepositData depositData)
```

Deletes a deposit from the queue (used for cancellation)

_Doesn't actually remove the element from the array, just clears its data_

#### Parameters

| Name         | Type                                | Description                                      |
| ------------ | ----------------------------------- | ------------------------------------------------ |
| depositQueue | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct |
| depositId    | uint256                             | The ID of the deposit to be deleted              |

#### Return Values

| Name        | Type                               | Description                                                   |
| ----------- | ---------------------------------- | ------------------------------------------------------------- |
| depositData | struct DepositQueueLib.DepositData | The data of the deleted deposit (returned for event emission) |

### batchDequeue

```solidity
function batchDequeue(struct DepositQueueLib.DepositQueue depositQueue, uint256 upToDepositId) internal returns (bytes32[])
```

Processes deposits in the queue for relay to Layer 2

_Collects valid deposit hashes from front to upToDepositId and advances the queue
Skips deposits that have been deleted (sender address is zero)_

#### Parameters

| Name          | Type                                | Description                                      |
| ------------- | ----------------------------------- | ------------------------------------------------ |
| depositQueue  | struct DepositQueueLib.DepositQueue | The storage reference to the DepositQueue struct |
| upToDepositId | uint256                             | The upper bound deposit ID to process            |

#### Return Values

| Name | Type      | Description                                         |
| ---- | --------- | --------------------------------------------------- |
| [0]  | bytes32[] | An array of deposit hashes to be relayed to Layer 2 |

## ERC20CallOptionalLib

A library for safely handling ERC20 token transfers that may not conform to the ERC20 standard

_Some ERC20 tokens don't revert on failure or don't return a boolean value as specified in the standard.
This library handles these non-standard implementations safely._

### callOptionalReturnBool

```solidity
function callOptionalReturnBool(contract IERC20 token, bytes data) internal returns (bool)
```

Makes a low-level call to an ERC20 token contract and safely handles various return value scenarios

\_Inspired by OpenZeppelin's SafeERC20 \_callOptionalReturnBool function
Handles three cases:

1.  Token returns true/false as per ERC20 spec
2.  Token returns nothing (empty return data)
3.  Token doesn't revert but returns non-boolean data\_

#### Parameters

| Name  | Type            | Description                                                        |
| ----- | --------------- | ------------------------------------------------------------------ |
| token | contract IERC20 | The ERC20 token contract to call                                   |
| data  | bytes           | The call data (typically a transfer or transferFrom function call) |

#### Return Values

| Name | Type | Description                                           |
| ---- | ---- | ----------------------------------------------------- |
| [0]  | bool | bool True if the call was successful, false otherwise |

## IPermitter

Interface for permission validation contracts that authorize user actions

_This interface defines the method for validating if a user has permission to execute a specific action_

### permit

```solidity
function permit(address user, uint256 value, bytes encodedData, bytes permission) external returns (bool authorized)
```

Validates if a user has the right to execute a specified action

_This function is called to check permissions before executing protected operations_

#### Parameters

| Name        | Type    | Description                                                                           |
| ----------- | ------- | ------------------------------------------------------------------------------------- |
| user        | address | The address of the user attempting the action                                         |
| value       | uint256 | The msg.value of the transaction being authorized                                     |
| encodedData | bytes   | The encoded function call data of the action that user wants to execute               |
| permission  | bytes   | The permission data that proves user authorization (format depends on implementation) |

#### Return Values

| Name       | Type | Description                                                                   |
| ---------- | ---- | ----------------------------------------------------------------------------- |
| authorized | bool | Returns true if the user is authorized to perform the action, false otherwise |

## IRollup

Interface for the Intmax2 L2 rollup contract

_Defines the external functions, events, and errors for the Rollup contract_

### AddressZero

```solidity
error AddressZero()
```

Error thrown when a required address parameter is the zero address

_Used in initialize function to validate address parameters_

### OnlyScrollMessenger

```solidity
error OnlyScrollMessenger()
```

Error thrown when a non-ScrollMessenger calls a function restricted to ScrollMessenger

_Used to enforce cross-chain message security_

### OnlyLiquidity

```solidity
error OnlyLiquidity()
```

Error thrown when the xDomainMessageSender in ScrollMessenger is not the liquidity contract

_Used to ensure only the authorized Liquidity contract can send cross-chain messages_

### TooManySenderPublicKeys

```solidity
error TooManySenderPublicKeys()
```

Error thrown when the number of public keys exceeds 128

_Used to limit the size of registration blocks_

### TooManyAccountIds

```solidity
error TooManyAccountIds()
```

Error thrown when the number of account IDs exceeds 128

_Used to limit the size of non-registration blocks_

### SenderAccountIdsInvalidLength

```solidity
error SenderAccountIdsInvalidLength()
```

Error thrown when the length of account IDs bytes is not a multiple of 5

_Each account ID must be exactly 5 bytes_

### PairingCheckFailed

```solidity
error PairingCheckFailed()
```

Error thrown when the posted block fails the pairing test

_Indicates an invalid signature or incorrect message point_

### BlockNumberOutOfRange

```solidity
error BlockNumberOutOfRange()
```

Error thrown when the specified block number is greater than the latest block number

_Used in getBlockHash to prevent accessing non-existent blocks_

### InsufficientPenaltyFee

```solidity
error InsufficientPenaltyFee()
```

Error thrown when the fee for the rate limiter is insufficient

_The msg.value must cover the penalty calculated by the rate limiter_

### Expired

```solidity
error Expired()
```

Error thrown when the expiry timestamp is in the past

_Block expiry timestamps must be in the future or zero (no expiry)_

### InvalidNonce

```solidity
error InvalidNonce()
```

Error thrown when the given nonce is less than the current nonce

_Nonces must be monotonically increasing to prevent replay attacks_

### DepositsProcessed

```solidity
event DepositsProcessed(uint256 lastProcessedDepositId, bytes32 depositTreeRoot)
```

Event emitted when deposits bridged from the liquidity contract are processed

_Triggered when the processDeposits function is called by the Liquidity contract_

#### Parameters

| Name                   | Type    | Description                                       |
| ---------------------- | ------- | ------------------------------------------------- |
| lastProcessedDepositId | uint256 | The ID of the last processed deposit              |
| depositTreeRoot        | bytes32 | The new root of the deposit tree after processing |

### DepositLeafInserted

```solidity
event DepositLeafInserted(uint32 depositIndex, bytes32 depositHash)
```

Event emitted when a deposit is inserted into the deposit tree

_Emitted for each deposit processed in the processDeposits function_

#### Parameters

| Name         | Type    | Description                                  |
| ------------ | ------- | -------------------------------------------- |
| depositIndex | uint32  | The index of the deposit in the deposit tree |
| depositHash  | bytes32 | The hash of the deposit data                 |

### BlockPosted

```solidity
event BlockPosted(bytes32 prevBlockHash, address blockBuilder, uint64 timestamp, uint256 blockNumber, bytes32 depositTreeRoot, bytes32 signatureHash)
```

Event emitted when a new block is posted to the rollup chain

_Contains all essential information about the newly posted block_

#### Parameters

| Name            | Type    | Description                                               |
| --------------- | ------- | --------------------------------------------------------- |
| prevBlockHash   | bytes32 | The hash of the previous block in the chain               |
| blockBuilder    | address | The address of the block builder who submitted the block  |
| timestamp       | uint64  | The timestamp when the block was posted                   |
| blockNumber     | uint256 | The sequential number of the posted block                 |
| depositTreeRoot | bytes32 | The root of the deposit tree at the time of block posting |
| signatureHash   | bytes32 | The hash of the block signature data                      |

### BlockPostData

Struct to store block data to avoid stack too deep errors

_Used in the internal \_postBlock function to organize block parameters_

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

Posts a registration block for senders' first transactions

_Registration blocks include the public keys of new senders_

#### Parameters

| Name                | Type       | Description                                                  |
| ------------------- | ---------- | ------------------------------------------------------------ |
| txTreeRoot          | bytes32    | The root of the transaction Merkle tree                      |
| expiry              | uint64     | The expiry timestamp of the tx tree root (0 means no expiry) |
| builderNonce        | uint32     | The registration block nonce of the block builder            |
| senderFlags         | bytes16    | Flags indicating which senders' signatures are included      |
| aggregatedPublicKey | bytes32[2] | The aggregated public key for signature verification         |
| aggregatedSignature | bytes32[4] | The aggregated signature of all participating senders        |
| messagePoint        | bytes32[4] | The hash of the tx tree root mapped to G2 curve point        |
| senderPublicKeys    | uint256[]  | Array of public keys for new senders (max 128)               |

### postNonRegistrationBlock

```solidity
function postNonRegistrationBlock(bytes32 txTreeRoot, uint64 expiry, uint32 builderNonce, bytes16 senderFlags, bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint, bytes32 publicKeysHash, bytes senderAccountIds) external payable
```

Posts a non-registration block for senders' subsequent transactions

_Non-registration blocks use account IDs instead of full public keys_

#### Parameters

| Name                | Type       | Description                                                  |
| ------------------- | ---------- | ------------------------------------------------------------ |
| txTreeRoot          | bytes32    | The root of the transaction Merkle tree                      |
| expiry              | uint64     | The expiry timestamp of the tx tree root (0 means no expiry) |
| builderNonce        | uint32     | The non-registration block nonce of the block builder        |
| senderFlags         | bytes16    | Flags indicating which senders' signatures are included      |
| aggregatedPublicKey | bytes32[2] | The aggregated public key for signature verification         |
| aggregatedSignature | bytes32[4] | The aggregated signature of all participating senders        |
| messagePoint        | bytes32[4] | The hash of the tx tree root mapped to G2 curve point        |
| publicKeysHash      | bytes32    | The hash of the public keys used in this block               |
| senderAccountIds    | bytes      | Byte array of account IDs (5 bytes per account)              |

### setRateLimitConstants

```solidity
function setRateLimitConstants(uint256 thresholdInterval, uint256 alpha, uint256 k) external
```

Sets the rate limiter constants for the rollup chain

_Can only be called by the contract owner_

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| thresholdInterval | uint256 | The threshold block submission interval in seconds |
| alpha             | uint256 | The alpha value for the exponential moving average |
| k                 | uint256 | The penalty coefficient for the rate limiter       |

### withdrawPenaltyFee

```solidity
function withdrawPenaltyFee(address to) external
```

Withdraws accumulated penalty fees from the Rollup contract

_Only the contract owner can call this function_

#### Parameters

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| to   | address | The address to which the penalty fees will be transferred |

### processDeposits

```solidity
function processDeposits(uint256 lastProcessedDepositId, bytes32[] depositHashes) external
```

Processes deposits from the Liquidity contract

_Can only be called by the Liquidity contract via Scroll Messenger_

#### Parameters

| Name                   | Type      | Description                                      |
| ---------------------- | --------- | ------------------------------------------------ |
| lastProcessedDepositId | uint256   | The ID of the last processed deposit             |
| depositHashes          | bytes32[] | Array of hashes for the deposits to be processed |

### getLatestBlockNumber

```solidity
function getLatestBlockNumber() external view returns (uint32)
```

Gets the block number of the latest posted block

_Returns the highest block number in the rollup chain_

#### Return Values

| Name | Type   | Description                          |
| ---- | ------ | ------------------------------------ |
| [0]  | uint32 | The latest block number (zero-based) |

### getPenalty

```solidity
function getPenalty() external view returns (uint256)
```

Gets the current penalty fee required by the rate limiter

_Calculated based on the exponential moving average of block intervals_

#### Return Values

| Name | Type    | Description                                                   |
| ---- | ------- | ------------------------------------------------------------- |
| [0]  | uint256 | The penalty fee in wei required for the next block submission |

### getBlockHash

```solidity
function getBlockHash(uint32 blockNumber) external view returns (bytes32)
```

Gets the block hash for a specific block number

_Reverts if the block number is out of range_

#### Parameters

| Name        | Type   | Description               |
| ----------- | ------ | ------------------------- |
| blockNumber | uint32 | The block number to query |

#### Return Values

| Name | Type    | Description                     |
| ---- | ------- | ------------------------------- |
| [0]  | bytes32 | The hash of the specified block |

## Rollup

Implementation of the Intmax2 L2 rollup contract

_Manages block submission, deposit processing, and maintains the state of the rollup chain_

### lastProcessedDepositId

```solidity
uint256 lastProcessedDepositId
```

The ID of the last processed deposit from the Liquidity contract

_Used to track which deposits have been included in the deposit tree_

### blockHashes

```solidity
bytes32[] blockHashes
```

Array of block hashes in the rollup chain

_Index 0 contains the genesis block hash_

### builderRegistrationNonce

```solidity
mapping(address => uint32) builderRegistrationNonce
```

Mapping of block builder addresses to their current nonce for registration blocks

_Used to prevent replay attacks and ensure block ordering_

### builderNonRegistrationNonce

```solidity
mapping(address => uint32) builderNonRegistrationNonce
```

Mapping of block builder addresses to their current nonce for non-registration blocks

_Used to prevent replay attacks and ensure block ordering_

### depositTreeRoot

```solidity
bytes32 depositTreeRoot
```

Current root of the deposit Merkle tree

_Updated whenever new deposits are processed_

### depositIndex

```solidity
uint32 depositIndex
```

Current index for the next deposit in the deposit tree

_Incremented for each processed deposit_

### onlyLiquidityContract

```solidity
modifier onlyLiquidityContract()
```

Modifier to restrict function access to the Liquidity contract via ScrollMessenger

_Verifies that the message sender is the ScrollMessenger and the xDomain sender is the Liquidity contract_

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _scrollMessenger, address _liquidity, address _contribution, uint256 _rateLimitThresholdInterval, uint256 _rateLimitAlpha, uint256 _rateLimitK) external
```

Initializes the Rollup contract

_Sets up the initial state with admin, ScrollMessenger, Liquidity, and Contribution contracts_

#### Parameters

| Name                         | Type    | Description                                             |
| ---------------------------- | ------- | ------------------------------------------------------- |
| \_admin                      | address | Address that will be granted ownership of the contract  |
| \_scrollMessenger            | address | Address of the L2 ScrollMessenger contract              |
| \_liquidity                  | address | Address of the Liquidity contract on L1                 |
| \_contribution               | address | Address of the Contribution contract                    |
| \_rateLimitThresholdInterval | uint256 | The threshold interval between block submissions        |
| \_rateLimitAlpha             | uint256 | The smoothing factor for the exponential moving average |
| \_rateLimitK                 | uint256 | The penalty coefficient for the rate limiter            |

### postRegistrationBlock

```solidity
function postRegistrationBlock(bytes32 txTreeRoot, uint64 expiry, uint32 builderNonce, bytes16 senderFlags, bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint, uint256[] senderPublicKeys) external payable
```

Posts a registration block for senders' first transactions

_Registration blocks include the public keys of new senders_

#### Parameters

| Name                | Type       | Description                                                  |
| ------------------- | ---------- | ------------------------------------------------------------ |
| txTreeRoot          | bytes32    | The root of the transaction Merkle tree                      |
| expiry              | uint64     | The expiry timestamp of the tx tree root (0 means no expiry) |
| builderNonce        | uint32     | The registration block nonce of the block builder            |
| senderFlags         | bytes16    | Flags indicating which senders' signatures are included      |
| aggregatedPublicKey | bytes32[2] | The aggregated public key for signature verification         |
| aggregatedSignature | bytes32[4] | The aggregated signature of all participating senders        |
| messagePoint        | bytes32[4] | The hash of the tx tree root mapped to G2 curve point        |
| senderPublicKeys    | uint256[]  | Array of public keys for new senders (max 128)               |

### postNonRegistrationBlock

```solidity
function postNonRegistrationBlock(bytes32 txTreeRoot, uint64 expiry, uint32 builderNonce, bytes16 senderFlags, bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint, bytes32 publicKeysHash, bytes senderAccountIds) external payable
```

Posts a non-registration block for senders' subsequent transactions

_Non-registration blocks use account IDs instead of full public keys_

#### Parameters

| Name                | Type       | Description                                                  |
| ------------------- | ---------- | ------------------------------------------------------------ |
| txTreeRoot          | bytes32    | The root of the transaction Merkle tree                      |
| expiry              | uint64     | The expiry timestamp of the tx tree root (0 means no expiry) |
| builderNonce        | uint32     | The non-registration block nonce of the block builder        |
| senderFlags         | bytes16    | Flags indicating which senders' signatures are included      |
| aggregatedPublicKey | bytes32[2] | The aggregated public key for signature verification         |
| aggregatedSignature | bytes32[4] | The aggregated signature of all participating senders        |
| messagePoint        | bytes32[4] | The hash of the tx tree root mapped to G2 curve point        |
| publicKeysHash      | bytes32    | The hash of the public keys used in this block               |
| senderAccountIds    | bytes      | Byte array of account IDs (5 bytes per account)              |

### processDeposits

```solidity
function processDeposits(uint256 _lastProcessedDepositId, bytes32[] depositHashes) external
```

### setRateLimitConstants

```solidity
function setRateLimitConstants(uint256 targetInterval, uint256 alpha, uint256 k) external
```

Sets the rate limiter constants for the rollup chain

_Can only be called by the contract owner_

#### Parameters

| Name           | Type    | Description                                        |
| -------------- | ------- | -------------------------------------------------- |
| targetInterval | uint256 | The target block submission interval in seconds    |
| alpha          | uint256 | The alpha value for the exponential moving average |
| k              | uint256 | The penalty coefficient for the rate limiter       |

### withdrawPenaltyFee

```solidity
function withdrawPenaltyFee(address to) external
```

Withdraws accumulated penalty fees from the Rollup contract

_Only the contract owner can call this function_

#### Parameters

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| to   | address | The address to which the penalty fees will be transferred |

### getLatestBlockNumber

```solidity
function getLatestBlockNumber() external view returns (uint32)
```

Gets the block number of the latest posted block

_Returns the highest block number in the rollup chain_

#### Return Values

| Name | Type   | Description                          |
| ---- | ------ | ------------------------------------ |
| [0]  | uint32 | The latest block number (zero-based) |

### getBlockHash

```solidity
function getBlockHash(uint32 blockNumber) external view returns (bytes32)
```

Gets the block hash for a specific block number

_Reverts if the block number is out of range_

#### Parameters

| Name        | Type   | Description               |
| ----------- | ------ | ------------------------- |
| blockNumber | uint32 | The block number to query |

#### Return Values

| Name | Type    | Description                     |
| ---- | ------- | ------------------------------- |
| [0]  | bytes32 | The hash of the specified block |

### getPenalty

```solidity
function getPenalty() external view returns (uint256)
```

Gets the current penalty fee required by the rate limiter

_Calculated based on the exponential moving average of block intervals_

#### Return Values

| Name | Type    | Description                                                   |
| ---- | ------- | ------------------------------------------------------------- |
| [0]  | uint256 | The penalty fee in wei required for the next block submission |

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Authorizes an upgrade to a new implementation

_Can only be called by the contract owner_

#### Parameters

| Name              | Type    | Description                                |
| ----------------- | ------- | ------------------------------------------ |
| newImplementation | address | Address of the new implementation contract |

## BlockHashLib

Library for managing block hashes in the Intmax2 rollup chain

_Provides utilities for calculating, storing, and retrieving block hashes_

### pushGenesisBlockHash

```solidity
function pushGenesisBlockHash(bytes32[] blockHashes, bytes32 initialDepositTreeRoot) internal
```

Pushes the genesis block hash to the block hashes array

_Creates the first block hash with special parameters for the genesis block_

#### Parameters

| Name                   | Type      | Description                                         |
| ---------------------- | --------- | --------------------------------------------------- |
| blockHashes            | bytes32[] | The storage array of block hashes                   |
| initialDepositTreeRoot | bytes32   | The initial deposit tree root for the genesis block |

### getBlockNumber

```solidity
function getBlockNumber(bytes32[] blockHashes) internal view returns (uint32)
```

Gets the current block number based on the number of block hashes

_The block number is equal to the length of the blockHashes array_

#### Parameters

| Name        | Type      | Description                       |
| ----------- | --------- | --------------------------------- |
| blockHashes | bytes32[] | The storage array of block hashes |

#### Return Values

| Name | Type   | Description                                                |
| ---- | ------ | ---------------------------------------------------------- |
| [0]  | uint32 | The current block number (length of the blockHashes array) |

### getPrevHash

```solidity
function getPrevHash(bytes32[] blockHashes) internal view returns (bytes32)
```

Gets the hash of the previous block

_Returns the last element in the blockHashes array_

#### Parameters

| Name        | Type      | Description                       |
| ----------- | --------- | --------------------------------- |
| blockHashes | bytes32[] | The storage array of block hashes |

#### Return Values

| Name | Type    | Description                    |
| ---- | ------- | ------------------------------ |
| [0]  | bytes32 | The hash of the previous block |

### pushBlockHash

```solidity
function pushBlockHash(bytes32[] blockHashes, bytes32 depositTreeRoot, bytes32 signatureHash, uint64 timestamp) internal returns (bytes32 blockHash)
```

Pushes a new block hash to the block hashes array

_Calculates the block hash based on inputs and appends it to the array_

#### Parameters

| Name            | Type      | Description                             |
| --------------- | --------- | --------------------------------------- |
| blockHashes     | bytes32[] | The storage array of block hashes       |
| depositTreeRoot | bytes32   | The deposit tree root for the new block |
| signatureHash   | bytes32   | The signature hash for the new block    |
| timestamp       | uint64    | The timestamp of the new block          |

#### Return Values

| Name      | Type    | Description                                |
| --------- | ------- | ------------------------------------------ |
| blockHash | bytes32 | The newly calculated and pushed block hash |

## DepositTreeLib

Library for managing a sparse Merkle tree for deposits in the Intmax2 protocol

_Based on https://github.com/0xPolygonHermez/zkevm-contracts/blob/main/contracts/lib/DepositContract.sol
Implements an incremental Merkle tree for efficiently tracking deposits_

### MerkleTreeFull

```solidity
error MerkleTreeFull()
```

Error thrown when the Merkle tree is full

_Thrown when attempting to add a deposit to a tree that has reached its maximum capacity_

### \_DEPOSIT_CONTRACT_TREE_DEPTH

```solidity
uint256 _DEPOSIT_CONTRACT_TREE_DEPTH
```

Depth of the Merkle tree

_The tree has a maximum of 2^32 - 1 leaves_

### DepositTree

Structure representing the deposit tree

_Contains the branch nodes, deposit count, and default hash for empty nodes_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct DepositTree {
	bytes32[32] _branch;
	uint256 depositCount;
	bytes32 defaultHash;
}
```

### \_MAX_DEPOSIT_COUNT

```solidity
uint256 _MAX_DEPOSIT_COUNT
```

Maximum number of deposits allowed in the tree

_Ensures depositCount fits into 32 bits (2^32 - 1)_

### initialize

```solidity
function initialize(struct DepositTreeLib.DepositTree depositTree) internal
```

Initializes the deposit tree with default values

_Sets up the default hash using an empty Deposit struct_

#### Parameters

| Name        | Type                              | Description                                     |
| ----------- | --------------------------------- | ----------------------------------------------- |
| depositTree | struct DepositTreeLib.DepositTree | The storage reference to the DepositTree struct |

### getRoot

```solidity
function getRoot(struct DepositTreeLib.DepositTree depositTree) internal pure returns (bytes32)
```

Computes and returns the current Merkle root

_Calculates the root by combining branch nodes with zero hashes_

#### Parameters

| Name        | Type                              | Description                                    |
| ----------- | --------------------------------- | ---------------------------------------------- |
| depositTree | struct DepositTreeLib.DepositTree | The memory reference to the DepositTree struct |

#### Return Values

| Name | Type    | Description                   |
| ---- | ------- | ----------------------------- |
| [0]  | bytes32 | The computed Merkle root hash |

### deposit

```solidity
function deposit(struct DepositTreeLib.DepositTree depositTree, bytes32 leafHash) internal
```

Adds a new leaf to the Merkle tree

_Updates the appropriate branch node and increments the deposit count_

#### Parameters

| Name        | Type                              | Description                                     |
| ----------- | --------------------------------- | ----------------------------------------------- |
| depositTree | struct DepositTreeLib.DepositTree | The storage reference to the DepositTree struct |
| leafHash    | bytes32                           | The hash of the new deposit leaf to be added    |

### getBranch

```solidity
function getBranch(struct DepositTreeLib.DepositTree depositTree) internal view returns (bytes32[32])
```

Retrieves the current branch nodes of the Merkle tree

_Used for generating Merkle proofs or debugging_

#### Parameters

| Name        | Type                              | Description                                     |
| ----------- | --------------------------------- | ----------------------------------------------- |
| depositTree | struct DepositTreeLib.DepositTree | The storage reference to the DepositTree struct |

#### Return Values

| Name | Type        | Description                                            |
| ---- | ----------- | ------------------------------------------------------ |
| [0]  | bytes32[32] | Array of branch node hashes at each height of the tree |

## PairingLib

Library for elliptic curve pairing operations used in signature verification

_Provides utilities for verifying BLS signatures using the precompiled pairing contract_

### PairingOpCodeFailed

```solidity
error PairingOpCodeFailed()
```

Error thrown when the elliptic curve pairing operation fails

_This can happen if the precompiled contract call fails or returns an invalid result_

### NEG_G1_X

```solidity
uint256 NEG_G1_X
```

X-coordinate of the negated generator point G1

_Used in the pairing check to verify signatures_

### NEG_G1_Y

```solidity
uint256 NEG_G1_Y
```

Y-coordinate of the negated generator point G1

_Used in the pairing check to verify signatures_

### pairing

```solidity
function pairing(bytes32[2] aggregatedPublicKey, bytes32[4] aggregatedSignature, bytes32[4] messagePoint) internal view returns (bool)
```

Performs an elliptic curve pairing operation to verify a BLS signature

_Uses the precompiled contract at address 8 to perform the pairing check_

#### Parameters

| Name                | Type       | Description                                                            |
| ------------------- | ---------- | ---------------------------------------------------------------------- |
| aggregatedPublicKey | bytes32[2] | The aggregated public key (2 32-byte elements representing a G1 point) |
| aggregatedSignature | bytes32[4] | The aggregated signature (4 32-byte elements representing a G2 point)  |
| messagePoint        | bytes32[4] | The message point (4 32-byte elements representing a G2 point)         |

#### Return Values

| Name | Type | Description                                                                 |
| ---- | ---- | --------------------------------------------------------------------------- |
| [0]  | bool | bool True if the signature is valid (pairing check passes), false otherwise |

## RateLimiterLib

A library for implementing a rate limiting mechanism with exponential moving average (EMA)

_Uses fixed-point arithmetic to calculate penalties for rapid block submissions_

### InvalidConstants

```solidity
error InvalidConstants()
```

Error thrown when trying to set the rate limiter constants to invalid values

### RateLimitConstantsSet

```solidity
event RateLimitConstantsSet(uint256 thresholdInterval, uint256 alpha, uint256 k)
```

Constants for the rate limiter

_thresholdInterval Threshold interval between calls (fixed-point)
alpha Smoothing factor for EMA (fixed-point)
k Scaling factor for the penalty calculation_

### RateLimitState

Struct to store the state of the rate limiter

_Holds constants and variables for the rate limiting mechanism_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct RateLimitState {
	UD60x18 thresholdInterval;
	UD60x18 alpha;
	UD60x18 k;
	uint256 lastCallTime;
	UD60x18 emaInterval;
}
```

### setConstants

```solidity
function setConstants(struct RateLimiterLib.RateLimitState state, uint256 thresholdInterval, uint256 alpha, uint256 k) internal
```

Sets the constants for the rate limiter

_Initializes the threshold interval, smoothing factor, and penalty scaling factor_

#### Parameters

| Name              | Type                                 | Description                                    |
| ----------------- | ------------------------------------ | ---------------------------------------------- |
| state             | struct RateLimiterLib.RateLimitState | The current state of the rate limiter          |
| thresholdInterval | uint256                              | Threshold interval between calls (fixed-point) |
| alpha             | uint256                              | Smoothing factor for EMA (fixed-point)         |
| k                 | uint256                              | Scaling factor for the penalty calculation     |

### update

```solidity
function update(struct RateLimiterLib.RateLimitState state) internal returns (uint256)
```

Updates the rate limiter state and calculates the penalty

_Updates lastCallTime and emaInterval, then returns the penalty_

#### Parameters

| Name  | Type                                 | Description                           |
| ----- | ------------------------------------ | ------------------------------------- |
| state | struct RateLimiterLib.RateLimitState | The current state of the rate limiter |

#### Return Values

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| [0]  | uint256 | The calculated penalty fee in wei |

### getPenalty

```solidity
function getPenalty(struct RateLimiterLib.RateLimitState state) internal view returns (uint256)
```

Computes the penalty that would be applied by update, without changing state

_Useful for checking the penalty before actually updating the state_

#### Parameters

| Name  | Type                                 | Description                           |
| ----- | ------------------------------------ | ------------------------------------- |
| state | struct RateLimiterLib.RateLimitState | The current state of the rate limiter |

#### Return Values

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| [0]  | uint256 | The calculated penalty fee in wei |

## IWithdrawal

Interface for the Withdrawal contract that processes withdrawals from L2 to L1

_Defines the functions, events, and errors for handling withdrawal proofs and token management_

### AddressZero

```solidity
error AddressZero()
```

Error thrown when a required address parameter is the zero address

_Used in initialize function to validate address parameters_

### WithdrawalChainVerificationFailed

```solidity
error WithdrawalChainVerificationFailed()
```

Error thrown when the verification of the withdrawal proof's public input hash chain fails

_Indicates that the chain of withdrawal hashes doesn't match the expected final hash_

### WithdrawalAggregatorMismatch

```solidity
error WithdrawalAggregatorMismatch()
```

Error thrown when the aggregator in the withdrawal proof's public input doesn't match the actual contract executor

_Ensures that only the designated aggregator can submit the proof_

### BlockHashNotExists

```solidity
error BlockHashNotExists(bytes32 blockHash)
```

Error thrown when the block hash in the withdrawal proof's public input doesn't exist

_Ensures that withdrawals reference valid blocks in the rollup chain_

#### Parameters

| Name      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| blockHash | bytes32 | The non-existent block hash that caused the error |

### WithdrawalProofVerificationFailed

```solidity
error WithdrawalProofVerificationFailed()
```

Error thrown when the zero-knowledge proof verification fails

_Indicates an invalid or malformed withdrawal proof_

### TokenAlreadyExist

```solidity
error TokenAlreadyExist(uint256 tokenIndex)
```

Error thrown when attempting to add a token to direct withdrawal tokens that already exists

_Prevents duplicate entries in the direct withdrawal token list_

#### Parameters

| Name       | Type    | Description                                                              |
| ---------- | ------- | ------------------------------------------------------------------------ |
| tokenIndex | uint256 | The index of the token that already exists in the direct withdrawal list |

### TokenNotExist

```solidity
error TokenNotExist(uint256 tokenIndex)
```

Error thrown when attempting to remove a non-existent token from direct withdrawal tokens

_Ensures that only tokens in the direct withdrawal list can be removed_

#### Parameters

| Name       | Type    | Description                                                       |
| ---------- | ------- | ----------------------------------------------------------------- |
| tokenIndex | uint256 | The index of the non-existent token in the direct withdrawal list |

### ClaimableWithdrawalQueued

```solidity
event ClaimableWithdrawalQueued(bytes32 withdrawalHash, address recipient, struct WithdrawalLib.Withdrawal withdrawal)
```

Emitted when a claimable withdrawal is queued

_Triggered for withdrawals of tokens not in the direct withdrawal list_

#### Parameters

| Name           | Type                            | Description                                       |
| -------------- | ------------------------------- | ------------------------------------------------- |
| withdrawalHash | bytes32                         | The hash of the withdrawal, used as an identifier |
| recipient      | address                         | The L1 address of the recipient                   |
| withdrawal     | struct WithdrawalLib.Withdrawal | The complete withdrawal details                   |

### DirectWithdrawalQueued

```solidity
event DirectWithdrawalQueued(bytes32 withdrawalHash, address recipient, struct WithdrawalLib.Withdrawal withdrawal)
```

Emitted when a direct withdrawal is queued

_Triggered for withdrawals of tokens in the direct withdrawal list_

#### Parameters

| Name           | Type                            | Description                                       |
| -------------- | ------------------------------- | ------------------------------------------------- |
| withdrawalHash | bytes32                         | The hash of the withdrawal, used as an identifier |
| recipient      | address                         | The L1 address of the recipient                   |
| withdrawal     | struct WithdrawalLib.Withdrawal | The complete withdrawal details                   |

### DirectWithdrawalTokenIndicesAdded

```solidity
event DirectWithdrawalTokenIndicesAdded(uint256[] tokenIndices)
```

Emitted when token indices are added to the direct withdrawal list

_Triggered by the addDirectWithdrawalTokenIndices function_

#### Parameters

| Name         | Type      | Description                                                          |
| ------------ | --------- | -------------------------------------------------------------------- |
| tokenIndices | uint256[] | Array of token indices that were added to the direct withdrawal list |

### DirectWithdrawalTokenIndicesRemoved

```solidity
event DirectWithdrawalTokenIndicesRemoved(uint256[] tokenIndices)
```

Emitted when token indices are removed from the direct withdrawal list

_Triggered by the removeDirectWithdrawalTokenIndices function_

#### Parameters

| Name         | Type      | Description                                                              |
| ------------ | --------- | ------------------------------------------------------------------------ |
| tokenIndices | uint256[] | Array of token indices that were removed from the direct withdrawal list |

### submitWithdrawalProof

```solidity
function submitWithdrawalProof(struct ChainedWithdrawalLib.ChainedWithdrawal[] withdrawals, struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs publicInputs, bytes proof) external
```

Submit and verify a withdrawal proof from Intmax2 L2

_Processes the withdrawals and relays them to the Liquidity contract on L1_

#### Parameters

| Name         | Type                                                              | Description                                         |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| withdrawals  | struct ChainedWithdrawalLib.ChainedWithdrawal[]                   | Array of chained withdrawals to process             |
| publicInputs | struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs | Public inputs for the withdrawal proof verification |
| proof        | bytes                                                             | The zero-knowledge proof data                       |

### getDirectWithdrawalTokenIndices

```solidity
function getDirectWithdrawalTokenIndices() external view returns (uint256[])
```

Get the list of token indices that can be withdrawn directly

_Returns the current set of direct withdrawal token indices_

#### Return Values

| Name | Type      | Description                                              |
| ---- | --------- | -------------------------------------------------------- |
| [0]  | uint256[] | An array of token indices that can be withdrawn directly |

### addDirectWithdrawalTokenIndices

```solidity
function addDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Add token indices to the list of direct withdrawal token indices
ERC721 and ERC1155 tokens are not supported for direct withdrawal.
When transferred to the liquidity contract, they will be converted to claimable withdrawals.

_Can only be called by the contract owner_

#### Parameters

| Name         | Type      | Description                                            |
| ------------ | --------- | ------------------------------------------------------ |
| tokenIndices | uint256[] | The token indices to add to the direct withdrawal list |

### removeDirectWithdrawalTokenIndices

```solidity
function removeDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Remove token indices from the list of direct withdrawal token indices

_Can only be called by the contract owner_

#### Parameters

| Name         | Type      | Description                                                 |
| ------------ | --------- | ----------------------------------------------------------- |
| tokenIndices | uint256[] | The token indices to remove from the direct withdrawal list |

## Withdrawal

Contract for processing withdrawals from L2 to L1 in the Intmax2 protocol

_Handles verification of withdrawal proofs and relays withdrawal information to the Liquidity contract on L1_

### nullifiers

```solidity
mapping(bytes32 => bool) nullifiers
```

Mapping of nullifiers to their used status

_Prevents double-spending of withdrawals_

### directWithdrawalTokenIndices

```solidity
struct EnumerableSet.UintSet directWithdrawalTokenIndices
```

Set of token indices that can be withdrawn directly

_Tokens not in this set will be processed as claimable withdrawals_

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _scrollMessenger, address _withdrawalVerifier, address _liquidity, address _rollup, address _contribution, uint256[] _directWithdrawalTokenIndices) external
```

Initializes the Withdrawal contract

_Sets up the initial state with required contract references and token indices_

#### Parameters

| Name                           | Type      | Description                                            |
| ------------------------------ | --------- | ------------------------------------------------------ |
| \_admin                        | address   | Address that will be granted ownership of the contract |
| \_scrollMessenger              | address   | Address of the L2 ScrollMessenger contract             |
| \_withdrawalVerifier           | address   | Address of the PLONK verifier for withdrawal proofs    |
| \_liquidity                    | address   | Address of the Liquidity contract on L1                |
| \_rollup                       | address   | Address of the Rollup contract                         |
| \_contribution                 | address   | Address of the Contribution contract                   |
| \_directWithdrawalTokenIndices | uint256[] | Initial list of token indices for direct withdrawals   |

### submitWithdrawalProof

```solidity
function submitWithdrawalProof(struct ChainedWithdrawalLib.ChainedWithdrawal[] withdrawals, struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs publicInputs, bytes proof) external
```

Submit and verify a withdrawal proof from Intmax2 L2

_Processes the withdrawals and relays them to the Liquidity contract on L1_

#### Parameters

| Name         | Type                                                              | Description                                         |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| withdrawals  | struct ChainedWithdrawalLib.ChainedWithdrawal[]                   | Array of chained withdrawals to process             |
| publicInputs | struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs | Public inputs for the withdrawal proof verification |
| proof        | bytes                                                             | The zero-knowledge proof data                       |

### getDirectWithdrawalTokenIndices

```solidity
function getDirectWithdrawalTokenIndices() external view returns (uint256[])
```

Get the list of token indices that can be withdrawn directly

_Returns the current set of direct withdrawal token indices_

#### Return Values

| Name | Type      | Description                                              |
| ---- | --------- | -------------------------------------------------------- |
| [0]  | uint256[] | An array of token indices that can be withdrawn directly |

### addDirectWithdrawalTokenIndices

```solidity
function addDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Add token indices to the list of direct withdrawal token indices
ERC721 and ERC1155 tokens are not supported for direct withdrawal.
When transferred to the liquidity contract, they will be converted to claimable withdrawals.

_Can only be called by the contract owner_

#### Parameters

| Name         | Type      | Description                                            |
| ------------ | --------- | ------------------------------------------------------ |
| tokenIndices | uint256[] | The token indices to add to the direct withdrawal list |

### removeDirectWithdrawalTokenIndices

```solidity
function removeDirectWithdrawalTokenIndices(uint256[] tokenIndices) external
```

Remove token indices from the list of direct withdrawal token indices

_Can only be called by the contract owner_

#### Parameters

| Name         | Type      | Description                                                 |
| ------------ | --------- | ----------------------------------------------------------- |
| tokenIndices | uint256[] | The token indices to remove from the direct withdrawal list |

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Authorizes an upgrade to a new implementation

_Can only be called by the contract owner_

#### Parameters

| Name              | Type    | Description                                |
| ----------------- | ------- | ------------------------------------------ |
| newImplementation | address | Address of the new implementation contract |

## ChainedWithdrawalLib

Library for handling chained withdrawals in a hash chain

_Provides utilities for creating and verifying a chain of withdrawal hashes
used in zero-knowledge proof verification_

### ChainedWithdrawal

Represents a withdrawal linked in a hash chain

_Contains all necessary information for processing a withdrawal and verifying its inclusion in a block_

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

_Computes the hash chain from the provided withdrawals and compares it to the expected final hash_

#### Parameters

| Name               | Type                                            | Description                                                                      |
| ------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| withdrawals        | struct ChainedWithdrawalLib.ChainedWithdrawal[] | Array of ChainedWithdrawals to verify                                            |
| lastWithdrawalHash | bytes32                                         | The expected hash of the last withdrawal in the chain (from proof public inputs) |

#### Return Values

| Name | Type | Description                                                                           |
| ---- | ---- | ------------------------------------------------------------------------------------- |
| [0]  | bool | bool True if the computed hash chain matches the expected final hash, false otherwise |

## WithdrawalProofPublicInputsLib

Library for handling public inputs of withdrawal zero-knowledge proofs

_Provides utilities for working with the public inputs that are part of withdrawal proof verification_

### WithdrawalProofPublicInputs

Represents the public inputs for a withdrawal zero-knowledge proof

_Contains the final hash of the withdrawal chain and the aggregator address_

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

_This hash is used as input to the zero-knowledge proof verification_

#### Parameters

| Name   | Type                                                              | Description                                         |
| ------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| inputs | struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs | The WithdrawalProofPublicInputs struct to be hashed |

#### Return Values

| Name | Type    | Description                                                                       |
| ---- | ------- | --------------------------------------------------------------------------------- |
| [0]  | bytes32 | bytes32 The resulting hash that will be split into uint256 array for the verifier |

## Contribution

Contract for tracking user contributions across different time periods

### CONTRIBUTOR

```solidity
bytes32 CONTRIBUTOR
```

Role identifier for contracts that can record contributions

_Addresses with this role can call the recordContribution function_

### startTimestamp

```solidity
uint256 startTimestamp
```

Start timestamp of the contribution period tracking

_Used as the reference point for calculating period numbers_

### periodInterval

```solidity
uint256 periodInterval
```

Duration of each contribution period in seconds

_Used to calculate the current period number_

### totalContributions

```solidity
mapping(uint256 => mapping(bytes32 => uint256)) totalContributions
```

Maps periods and tags to total contributions

_Mapping structure: period => tag => total contribution amount_

### userContributions

```solidity
mapping(uint256 => mapping(bytes32 => mapping(address => uint256))) userContributions
```

Maps periods, tags, and users to their individual contributions

_Mapping structure: period => tag => user address => contribution amount_

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address admin, uint256 _periodInterval) external
```

Initializes the contract with an admin and period interval

_Sets up the initial state of the contract and aligns the start timestamp_

#### Parameters

| Name             | Type    | Description                                           |
| ---------------- | ------- | ----------------------------------------------------- |
| admin            | address | Address that will be granted the DEFAULT_ADMIN_ROLE   |
| \_periodInterval | uint256 | Duration of each period in seconds (must be non-zero) |

### getCurrentPeriod

```solidity
function getCurrentPeriod() public view returns (uint256)
```

Calculates the current period number based on the current timestamp

_Calculated as (current_timestamp - startTimestamp) / periodInterval_

#### Return Values

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| [0]  | uint256 | The current period number |

### recordContribution

```solidity
function recordContribution(bytes32 tag, address user, uint256 amount) external
```

Records a contribution for a specific tag and user

_Updates both total and user-specific contribution amounts for the current period_

#### Parameters

| Name   | Type    | Description                                                        |
| ------ | ------- | ------------------------------------------------------------------ |
| tag    | bytes32 | The tag associated with the contribution (used for categorization) |
| user   | address | The address of the user making the contribution                    |
| amount | uint256 | The amount of contribution to record                               |

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Authorizes an upgrade to a new implementation

_Can only be called by an account with the DEFAULT_ADMIN_ROLE_

#### Parameters

| Name              | Type    | Description                                |
| ----------------- | ------- | ------------------------------------------ |
| newImplementation | address | Address of the new implementation contract |

## PredicatePermitter

Implementation of IPermitter that uses Predicate Protocol for permission validation

_Leverages Predicate Protocol's policy-based authorization system to validate user permissions_

### AddressZero

```solidity
error AddressZero()
```

Error thrown when an address parameter is the zero address

_Used in initialize function to validate admin and predicateManager addresses_

### PolicyIDEmpty

```solidity
error PolicyIDEmpty()
```

Error thrown when the policy ID string is empty

_Used in initialize function to validate the policyID parameter_

### PolicySet

```solidity
event PolicySet(string policyID)
```

Emitted when the Predicate policy ID is set or updated

_Triggered in initialize and setPolicy functions_

#### Parameters

| Name     | Type   | Description                    |
| -------- | ------ | ------------------------------ |
| policyID | string | The new policy ID that was set |

### PredicateManagerSet

```solidity
event PredicateManagerSet(address predicateManager)
```

Emitted when the Predicate manager address is set or updated

_Triggered in initialize and setPredicateManager functions_

#### Parameters

| Name             | Type    | Description                       |
| ---------------- | ------- | --------------------------------- |
| predicateManager | address | The new Predicate manager address |

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _admin, address _predicateManager, string policyID) external
```

Initializes the PredicatePermitter contract

_Sets up the initial state with admin, Predicate manager, and policy ID_

#### Parameters

| Name               | Type    | Description                                            |
| ------------------ | ------- | ------------------------------------------------------ |
| \_admin            | address | Address that will be granted ownership of the contract |
| \_predicateManager | address | Address of the Predicate Protocol manager contract     |
| policyID           | string  | The policy ID string used for permission validation    |

### permit

```solidity
function permit(address user, uint256 value, bytes encodedData, bytes permission) external returns (bool)
```

Validates if a user has permission to execute a specified action

_Decodes the permission data as a PredicateMessage and uses Predicate Protocol for validation_

#### Parameters

| Name        | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| user        | address | The address of the user attempting the action     |
| value       | uint256 | The msg.value of the transaction being authorized |
| encodedData | bytes   | The encoded function call data of the action      |
| permission  | bytes   | The permission data containing a PredicateMessage |

#### Return Values

| Name | Type | Description                                       |
| ---- | ---- | ------------------------------------------------- |
| [0]  | bool | Boolean indicating whether the user is authorized |

### setPolicy

```solidity
function setPolicy(string policyID) external
```

Set the policy ID of Predicate

_Only the owner can call this function_

#### Parameters

| Name     | Type   | Description          |
| -------- | ------ | -------------------- |
| policyID | string | The policy ID to set |

### setPredicateManager

```solidity
function setPredicateManager(address serviceManager) external
```

Set the Predicate Manager

_Only the owner can call this function_

#### Parameters

| Name           | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| serviceManager | address | The Predicate Manager address to set |

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Authorizes an upgrade to a new implementation

_Can only be called by the contract owner_

#### Parameters

| Name              | Type    | Description                                |
| ----------------- | ------- | ------------------------------------------ |
| newImplementation | address | Address of the new implementation contract |

## ClaimPlonkVerifier

### Verify

```solidity
function Verify(bytes proof, uint256[] public_inputs) public view returns (bool success)
```

Verify a Plonk proof.
Reverts if the proof or the public inputs are malformed.

#### Parameters

| Name          | Type      | Description                                            |
| ------------- | --------- | ------------------------------------------------------ |
| proof         | bytes     | serialised plonk proof (using gnark's MarshalSolidity) |
| public_inputs | uint256[] | (must be reduced)                                      |

#### Return Values

| Name    | Type | Description                              |
| ------- | ---- | ---------------------------------------- |
| success | bool | true if the proof passes false otherwise |

## WithdrawalPlonkVerifier

### Verify

```solidity
function Verify(bytes proof, uint256[] public_inputs) public view returns (bool success)
```

Verify a Plonk proof.
Reverts if the proof or the public inputs are malformed.

#### Parameters

| Name          | Type      | Description                                            |
| ------------- | --------- | ------------------------------------------------------ |
| proof         | bytes     | serialised plonk proof (using gnark's MarshalSolidity) |
| public_inputs | uint256[] | (must be reduced)                                      |

#### Return Values

| Name    | Type | Description                              |
| ------- | ---- | ---------------------------------------- |
| success | bool | true if the proof passes false otherwise |
