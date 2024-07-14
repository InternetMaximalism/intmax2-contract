# INTMAX2 Contract Interface

## Environment Variables

- `PRIVATE_KEY`: User's private key
- `ALCHEMY_KEY`: Alchemy key

## How to run

### Deploy Locally

```sh
npm i
npx hardhat node
```

Open a new terminal and run the following commands:

```sh
echo "{}" > ./scripts/contractAddresses.json # initialize contract addresses
npx hardhat run ./scripts/deployTestErc20.ts --network localhost
npx hardhat run ./scripts/deployPlonkVerifier.ts --network localhost
npx hardhat run ./scripts/deployStep1ToL2.ts --network localhost
npx hardhat run ./scripts/deployStep2ToL1.ts --network localhost
npx hardhat run ./scripts/deployStep3ToL2.ts --network localhost
```

### Deposit ETH

```sh
npx hardhat run ./scripts/depositETH.ts --network localhost
```

### Deposit ERC20

```sh
npx hardhat run ./scripts/depositERC20.ts --network localhost
```

## Deploy to Scroll & Scroll Sepolia (TODO)

You must own ETH in the Sepolia and Scroll Sepolia networks respectively.

```sh
npm i
npm run deploy
```

### Send message from L1 to L2

```sh
npm run send-message-from-l1
```

### Send message from L2 to L1

```sh
npm run send-message-from-l2
npm run relay-message-from-l2
```

### lint

```sh
npm run lint
```
