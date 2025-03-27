# INTMAX2 Contract

## Installation

```sh
# Clone the repository
git clone https://github.com/your-org/intmax2-contract.git
cd intmax2-contract

# Install dependencies
npm install
```

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
# Run all tests
npm test

# Run specific test file
npx hardhat test test/path/to/test-file.test.ts
```

### Documentation

Generate documentation from NatSpec comments in the contracts:

```sh
npx hardhat docgen
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
- `utils/`: Utility functions
- `test_data/`: Test data files
- `test_data_generator/`: Tools for generating test data
