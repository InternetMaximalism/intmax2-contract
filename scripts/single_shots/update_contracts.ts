import { ethers, upgrades, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

if (network.name !== 'sepolia') {
    throw new Error('This script should be run on sepolia network')
}

async function main() {
    const deployedContracts = await readDeployedContracts()
    if (!deployedContracts.liquidity) {
        throw new Error('liquidity contract should be deployed')
    }
    if (!deployedContracts.l1Contribution) {
        throw new Error('l1Contribution contract should be deployed')
    }

    const liquidity = await ethers.getContractAt('Liquidity', deployedContracts.liquidity)
    const zeroAddress = ethers.ZeroAddress;
    const tx = await liquidity.updateContractAddresses(deployedContracts.l1Contribution, zeroAddress, zeroAddress, zeroAddress)
    console.log('Transaction hash:', tx.hash)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
