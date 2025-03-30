# INTMAX2 Contract

## Installation

### As a Git Repository

```sh
# Clone the repository
git clone https://github.com/InternetMaximalism/intmax2-contract.git
cd intmax2-contract

# Install dependencies
npm install
```

### As an NPM Package

```sh
# Install from npm
npm install intmax2-contract
```

### For Foundry Projects

In your `foundry.toml` file, add:

```toml
[profile.default]
libs = ['node_modules']
```

Then install the package:

```sh
# Install the package
npm install intmax2-contract

# Or with Forge
forge install --no-git intmax2-contract
```

## Project Structure

- `contracts/`: Smart contract source code
  - `block-builder-registry/`: Block builder registration and management
  - `claim/`: Claim processing and verification
  - `common/`: Shared libraries and utilities
  - `contribution/`: Contribution management
  - `liquidity/`: Liquidity pool management
  - `permitter/`: Permission management
  - `rollup/`: Rollup functionality
  - `withdrawal/`: Withdrawal processing
  - `verifiers/`: Proof verification contracts
  - `test/`: Test contracts
- `scripts/`: Deployment and operational scripts
- `test/`: Test files
- `test_data/`: Test data files
- `test_data_generator/`: Tools for generating test data

## Contract Overview

<p align="center">
  <img src="https://github.com/user-attachments/assets/32d0dbd0-0fb7-4506-8810-0adf73494340" width="500">
</p>

### Rollup

A smart contract responsible for handling operations related to Intmax blocks.

- **Deployment:** Scroll
- **Functions:**
  - **Block Posting:** Allows posting blocks.
  - **Deposit Processing:** Integrates deposits from the liquidity contract into the Rollup state.
  - **Penalty Fee Management:** Enables withdrawal and adjustment of penalty fees associated with rate limiting.

### Liquidity

This contract manages asset transfers between the Ethereum and Intmax networks. It handles user deposit and withdrawal operations and maintains asset states.

- **Deployment:** Ethereum
- **Functions:**
  - **Asset Deposits:** Users can deposit tokens (native tokens, ERC20, ERC721, ERC1155) from Ethereum into Intmax.
  - **AML Check:** Performs AML checks upon deposits and rejects deposits from non-compliant addresses.
  - **Asset Withdrawals:** Sends tokens withdrawn from Intmax to users on Ethereum.
  - **Deposit Management:** Stores deposited tokens in a queue, and a Deposit Relayer communicates this information to the Intmax network.
  - **Contribution Recording:** Records addresses executing essential transactions (such as withdrawals).

### Withdrawal

Manages withdrawal processes from the Intmax network to Ethereum, verifies withdrawal proofs, and manages eligible token indices for direct withdrawals.

- **Deployment:** Scroll
- **Functions:**
  - **Withdrawal Request Submission:** Allows submission and verification of withdrawal proofs from Intmax.
  - **Token Management for Direct Withdrawals:** Manages token indices eligible for direct withdrawals.

### Claim

Used to claim rewards from privacy mining, distributing ITX tokens on Ethereum.

- **Deployment:** Scroll
- **Functions:**
  - **Claim Proof Submission:** Submit claim proof from Intmax network.
  - **Token Management for Direct Withdrawals:** Manages tokens eligible for direct withdrawals.

### Block Builder Registry

Maintains a registry of active block builders via heartbeat signals.

- **Deployment:** Scroll
- **Functions:**
  - **Heartbeat Emission:** Enables periodic signals indicating active status.

### L1/L2 Contribution

Manages user contributions, tracking allocations, weights, and reward distributions.

- **Deployment:** Ethereum and Scroll
- **Functions:**
  - **Contribution Recording:** Records user contributions with tags for specific periods.
  - **Period Management:** Manages periodic increments and resets for contributions.
  - **Weight Management:** Assigns and manages tag weights for each period.

### Permitter Contract

Verifies AML checks and validates legitimate mining activity via Predicate service. Invoked by Liquidity contract during deposits.

- **Deployment**: Ethereum
- **Functions:**
  - **Policy Verification:** Rejects deposits from addresses not compliant with AML and mining validation policies.


## Environment Setup

Create a `.env` file in the root directory with the following variables:

### Required Variables

- `DEPLOYER_PRIVATE_KEY`: Deployer's private key for contract deployment
- `ADMIN_ADDRESS`: Admin's address for contract initialization and management
- `RELAYER_ADDRESS`: Relayer's address for the Liquidity contract
- `CONTRIBUTION_PERIOD_INTERVAL`: Contribution period interval in seconds
- `CLAIM_PERIOD_INTERVAL`: Claim period interval in seconds

### API Keys

- `ALCHEMY_KEY`: Key for Alchemy API access
- `ETHERSCAN_API_KEY`: Key for Etherscan contract verification
- `SCROLLSCAN_API_KEY`: Key for Scrollscan contract verification

### Optional Variables with Defaults

- `ADMIN_PRIVATE_KEY`: Admin's private key (required if `GRANT_ROLE=true`)
- `RELAYER_PRIVATE_KEY`: Relayer's private key (required for running relay scripts like `relayDeposits.ts`)
- `GRANT_ROLE`: Set to `true` to grant roles during deployment (default: `false`)
- `DEPLOY_MOCK_MESSENGER`: Set to `true` to deploy mock messenger contracts for testing (default: `false`)
- `SLEEP_TIME`: Sleep time in seconds between deployments (default: `30`)

### Rate Limiting Parameters (for Rollup contract)

- `RATELIMIT_THRESHOLD_INTERVAL`: Target interval for rate limiting (default: `10^18 * 30` - 30 seconds in fixed point)
- `RATELIMIT_ALPHA`: Alpha parameter for rate limiting (default: `10^18 / 3` - 1/3 in fixed point)
- `RATELIMIT_K`: K parameter for rate limiting (default: `10^18 / 1000` - 0.001 in fixed point)

You can use the provided `.env.example` file as a template.

## Deployment

The deployment process consists of 3 sequential stages. Each stage must be completed before proceeding to the next.

![Contract Deployment](https://github.com/user-attachments/assets/129276f9-7b84-4d19-af9a-5c74e6f36a38)

### Network Configuration

Set the appropriate network variables before running the deployment scripts:

For localhost environment:

```sh
L1_NETWORK=localhost
L2_NETWORK=localhost
```

For testnet environment:

```sh
L1_NETWORK=sepolia
L2_NETWORK=scrollSepolia
```

For mainnet environment:

```sh
L1_NETWORK=mainnet
L2_NETWORK=scroll
```

### Deployment Steps

Execute the following scripts in sequence:

```sh
# Step 1: Deploy contracts to L2
npx hardhat run ./scripts/deploy/1_deployToL2.ts --network $L2_NETWORK

# Step 2: Deploy contracts to L1
npx hardhat run ./scripts/deploy/2_deployToL1.ts --network $L1_NETWORK

# Step 3: Initialize L2 contracts
npx hardhat run ./scripts/deploy/3_initializeOnL2.ts --network $L2_NETWORK
```

## Testing and Operational Scripts

The following scripts can be used to test and operate the INTMAX2 protocol:

### Deposit and Withdrawal Operations

#### 1. Deposit ETH and Cancel Deposit

Users can deposit ETH to the contract and cancel the deposit if needed:

```sh
npx hardhat run scripts/test/depositEth.ts --network $L1_NETWORK
npx hardhat run scripts/test/depositAndCancelEth.ts --network $L1_NETWORK
```

#### 2. Deposit ERC20 and Cancel Deposit

Users can deposit ERC20 tokens to the contract and cancel the deposit if needed:

```sh
npx hardhat run scripts/test/depositAndCancelErc20.ts --network $L1_NETWORK
```

#### 3. Relay Deposits to L2

The relayer transfers analyzed deposits from L1 to L2:

```sh
npx hardhat run scripts/test/relayDeposits.ts --network $L1_NETWORK
```

#### 4. Post Block

Block builders post blocks to the contract:

```sh
npx hardhat run scripts/test/postBlock.ts --network $L2_NETWORK
```

#### 5. Submit Withdrawal Proof on L2

When a user wants to withdraw assets from INTMAX2, the withdrawal aggregator submits the withdrawal proof:

```sh
npx hardhat run scripts/test/submitWithdrawalProof.ts --network $L2_NETWORK
```

#### 6. Relay Withdrawals to L1

The withdrawal aggregator relays user withdrawals from L2 to L1:

```sh
npx hardhat run scripts/test/relayClaims.ts --network $L2_NETWORK
```

### Claim Operations

#### Submit Claim Proof

```sh
npx hardhat run scripts/test/submitClaimProof.ts --network $L2_NETWORK
```

### Utility Scripts

#### Get Token Information

```sh
npx hardhat run scripts/test/getTokenInfo.ts --network $L2_NETWORK
```

## Development

### Linting

```sh
npm run lint
```

### Testing

```sh
npm test
```

### Documentation

Generate documentation from NatSpec comments in the contracts:

```sh
npx hardhat docgen
```
