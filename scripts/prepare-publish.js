#!/usr/bin/env node

/**
 * This script prepares the package for publishing to npm.
 * It compiles the contracts and builds the TypeScript files in src.
 * 
 * Note: This package only includes the contracts, not the utility scripts.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to execute a command and log its output
function execute(command, message) {
  log(`\n${colors.bright}${colors.blue}${message}${colors.reset}`);
  log(`> ${command}\n`, colors.yellow);
  
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n${colors.red}Error executing command: ${command}${colors.reset}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

// Main function
async function main() {
  log(`\n${colors.bright}${colors.green}=== Preparing INTMAX2 Contract Package for Publishing ===${colors.reset}\n`);
  
  // Step 1: Clean previous build artifacts
  if (!execute('rm -rf dist', 'Cleaning previous build artifacts...')) {
    process.exit(1);
  }
  
  // Step 2: Compile contracts
  if (!execute('npx hardhat compile', 'Compiling contracts...')) {
    process.exit(1);
  }
  
  // Step 3: Build TypeScript files
  if (!execute('npm run build', 'Building TypeScript files...')) {
    process.exit(1);
  }
  
  // Step 4: Verify that required directories exist
  const requiredDirs = ['dist', 'artifacts/contracts'];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log(`\n${colors.red}Error: Directory '${dir}' does not exist. Build failed.${colors.reset}`, colors.red);
      process.exit(1);
    }
  }
  
  // Step 5: Copy README.md to dist for better npm package display
  if (!execute('cp README.md dist/', 'Copying README.md to dist...')) {
    process.exit(1);
  }
  
  log(`\n${colors.bright}${colors.green}=== Package Preparation Complete ===${colors.reset}`);
  log(`\nYou can now publish the package with: ${colors.yellow}npm publish${colors.reset}`);
  log(`\nNote: This package only includes the contracts, not the utility scripts.`);
}

main().catch((error) => {
  log(`\n${colors.red}Error: ${error.message}${colors.reset}`, colors.red);
  process.exit(1);
});
