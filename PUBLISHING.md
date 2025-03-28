# Publishing Guide for INTMAX2 Contract

This guide provides instructions for publishing the INTMAX2 Contract package to npm and making it available for both npm and Foundry users.

## Prerequisites

Before publishing, ensure you have:

1. An npm account with publishing rights to the package
2. Node.js v20 or later installed
3. All changes committed to the repository

## Preparing for Publication

The package includes a script to prepare for publication:

```sh
npm run prepare-publish
```

This script will:
1. Clean previous build artifacts
2. Compile the Solidity contracts
3. Generate TypeScript type definitions
4. Build the TypeScript files

## Publishing to npm

Once the package is prepared, you can publish it to npm:

```sh
npm publish
```

If you want to publish a beta version:

```sh
npm publish --tag beta
```

## Version Management

To update the package version, use the npm version command:

```sh
# For patch updates (0.0.x)
npm version patch

# For minor updates (0.x.0)
npm version minor

# For major updates (x.0.0)
npm version major

# For pre-release versions
npm version prerelease --preid=beta
```

## Testing the Package Locally

Before publishing, you can test the package locally:

1. Build the package:
   ```sh
   npm run prepare-publish
   ```

2. Create a test project and link the package:
   ```sh
   mkdir test-project
   cd test-project
   npm init -y
   npm link ../path/to/intmax2-contract
   ```

3. Create a test script to verify the package works:
   ```js
   // test.js
   const intmax2 = require('intmax2-contract');
   console.log('Contract Names:', intmax2.ContractNames);
   ```

4. Run the test script:
   ```sh
   node test.js
   ```

## Foundry Integration Testing

To test the Foundry integration:

1. Create a test Foundry project:
   ```sh
   forge init foundry-test
   cd foundry-test
   ```

2. Install the package:
   ```sh
   npm install ../path/to/intmax2-contract
   ```

3. Update the foundry.toml file:
   ```toml
   [profile.default]
   src = 'src'
   out = 'out'
   libs = ['node_modules']
   ```

4. Create a test contract that imports from the package:
   ```solidity
   // src/TestImport.sol
   pragma solidity ^0.8.27;

   import "intmax2-contract/contracts/rollup/Rollup.sol";

   contract TestImport {
       Rollup public rollup;
       
       constructor(address _rollupAddress) {
           rollup = Rollup(_rollupAddress);
       }
   }
   ```

5. Compile to verify the imports work:
   ```sh
   forge build
   ```

## Troubleshooting

If you encounter issues during the publishing process:

1. **TypeScript Compilation Errors**: Check that all imports in src/index.ts are correct and that the tsconfig.json is properly configured.

2. **Missing Files in Published Package**: Verify the "files" field in package.json includes all necessary files and that .npmignore doesn't exclude required files.

3. **Foundry Import Errors**: Ensure the contracts are properly structured and that the foundry.toml configuration is correct.

4. **Hardhat Artifacts Missing**: Make sure the contracts are compiled before publishing and that the artifacts are included in the package.
