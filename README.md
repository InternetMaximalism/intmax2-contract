# INTMAX2 Contract

## For developer

## Generate contract docs from NatSpecs

## Environment Variables

Create a `.env` file with the following:

- `DEPLOYER_PRIVATE_KEY`: Deployer's private key
- `ADMIN_ADDRESS`: Admin's address
- `RELAYER_ADDRESS`: Relayer's address
- `ALCHEMY_KEY`: Key for Alchemy API access
- `ETHERSCAN_API_KEY`: Key for Etherscan verification
- `SCROLLSCAN_API_KEY`: Key for Scrollscan verification

## Deployment

The deployment process consists of 3 stages. Please execute the following scripts in sequence.

For localhost environment:

```
L1_NETWORK=localhost
L2_NETWORK=localhost
```

For testnet environment:

```
L1_NETWORK=sepolia
L2_NETWORK=scrollSepolia
```

For mainnet environment:

```
L1_NETWORK=mainnet
L2_NETWORK=scroll
```

Please specify the appropriate network values as shown above.

```sh
npx hardhat run ./scripts/deploy/1_deployToL2.ts --network $L2_NETWORK
npx hardhat run ./scripts/deploy/2_deployToL1.ts --network $L1_NETWORK
npx hardhat run ./scripts/deploy/3_initializeOnL2.ts --network $L2_NETWORK
```

## How run scripts

#### 1. Deposit Eth and cancel deposit

**User** deposits Eth to the contract and cancels the deposit.

```sh
npx hardhat run scripts/test/depositAndCancelEth.ts --network $L1_NETWORK
```

#### 2. Deposit ERC20 and cancel deposit

**User** deposits Eth to the contract and cancels the deposit.

```sh
npx hardhat run scripts/test/depositAndCancelERC20.ts --network $L1_NETWORK
```

#### 3. Relay deposits to L2

The **relayer** relays the already analyzed deposits to L2.
Before running this script, you need to run the analyzeDeposit script.

```sh
npx hardhat run scripts/test/relayDeposits.ts --network $L1_NETWORK
```

#### 4. Post block

**Block builders** post blocks to the contract.

```sh
npx hardhat run scripts/test/postBlock.ts --network $L2_NETWORK
```

#### 5. Withdrawal on L2

User wants to withdraw assets from Intmax2. The **withdrawal aggregator** aggregates the user's balance proof and generates a withdrawal proof. Then, the **withdrawal aggregator** submits the withdrawal proof to the withdrawal contract by running the following script.

```sh
npx hardhat run scripts/test/withdrawalL2.ts --network scrollSepolia
```

#### 6. Relay withdrawals to L1

**Withdrawal aggregator** relays user's withdrawal on L2 to L1.

```sh
npx hardhat run scripts/test/relayWithdrawals.ts --network scrollSepolia
```

### lint

```sh
npm run lint
```

### generate docs

```sh
npx run docgen
```
