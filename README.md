# INTMAX2 Contract Interface

## Environment Variables

- `DEPLOYER_PRIVATE_KEY`: Deployer's private key
- `ANALYZER_PRIVATE_KEY`: Analyzer's private key
- `ALCHEMY_KEY`: Alchemy key

## Deployment

```sh
echo "{}" > ./scripts/data/deployedContracts.json # initialize contract addresses
npx hardhat run ./scripts/deploy/1_deployToL2.ts --network scrollSepolia
npx hardhat run ./scripts/deploy/2_deployToL1.ts --network sepolia
npx hardhat run ./scripts/deploy/3_initializeOnL2.ts --network scrollSepolia
```

## How run scripts

### Deposit on L1

#### 1. Deposit Eth and cancel deposit

```sh
npx hardhat run scripts/test/depositAndCancelEth.ts --network sepolia
```

#### 2. Deposit ERC20 and cancel deposit

```sh
npx hardhat run scripts/test/depositAndCancelERC20.ts --network sepolia
```

#### 3. Analyze deposit

The analyzer checks the deposit and rejects deposits that do not meet the AML criteria.
Before running this script, make at least one deposit.
By commenting out the cancel part of the above script, you can make a deposit only.

```sh
npx hardhat run scripts/test/analyzeDeposit.ts --network sepolia
```

#### 4. Relay deposits to L2

The relayer relays the already analyzed deposits to L2.
Before running this script, you need to run the analyzeDeposit script.

```sh
npx hardhat run scripts/test/relayDeposits.ts --network sepolia
```

#### 5. Block builder registration

Block builders need to stake and register the URL of their API endpoint to post blocks.

```sh
npx hardhat run scripts/test/updateBlockBuilder.ts --network scrollSepolia
```

#### 6. Post block

Block builders post blocks to the contract.

```sh
npx hardhat run scripts/test/postBlock.ts --network scrollSepolia
```

#### 7. Withdrawal on L2

User wants to withdraw assets from Intmax2. The withdrawal aggregator aggregates the user's balance proof and generates a withdrawal proof. Then, the withdrawal aggregator submits the withdrawal proof to the withdrawal contract by running the following script.

```sh
npx hardhat run scripts/test/withdrawalL2.ts --network scrollSepolia
```

#### 8. Relay withdrawals to L1

Withdrawal aggregator relays user's withdrawal on L2 to L1.

```sh
npx hardhat run scripts/test/relayWithdrawals.ts --network scrollSepolia
```

## Run E2E test locally

```sh
npm run test test/integration.ts
```

### E2E test

#### 1. Deposit on L1 & Relay to L2

```sh
npx hardhat run scripts/e2e/1_deposit.ts --network sepolia
```

#### 2. Withdraw on L2

```sh
npx hardhat run scripts/e2e/2_withdrawal_l2.ts --network scrollSepolia
```

#### 3. Withdraw on L1

This script should be executed after the messaging bridge of scroll is completed. This usually takes a few hours.

```sh
npx hardhat run scripts/e2e/3_withdrawal_l1.ts --network sepolia
```

### lint

```sh
npm run lint
```
