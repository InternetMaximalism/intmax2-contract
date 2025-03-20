# INTMAX2 Contract: Single chain branch

## Environment Variables

- `DEPLOYER_PRIVATE_KEY`: Deployer's private key
- `ANALYZER_PRIVATE_KEY`: Analyzer's private key
- `ALCHEMY_KEY`: Alchemy key

## Deployment

```sh
npx hardhat run ./scripts/deploy/1_deployToL2.ts --network sepolia
npx hardhat run ./scripts/deploy/2_deployToL1.ts --network sepolia
npx hardhat run ./scripts/deploy/3_initializeOnL2.ts --network sepolia
```
