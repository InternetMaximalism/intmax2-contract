import { ethers, upgrades, network } from 'hardhat'
import { readDeployedContracts } from '../utils/io'

if (network.name !== 'scrollSepolia') {
    throw new Error('This script should be run on scroll sepolia network')
}

async function main() {
    const deployedContracts = await readDeployedContracts()
    if (!deployedContracts.rollup) {
        throw new Error('rollup contract should be deployed')
    }
    if (!deployedContracts.withdrawal) {
        throw new Error('withdrawal contract should be deployed')
    }
    if (!deployedContracts.mockL2ScrollMessenger) {
        throw new Error('mockL2ScrollMessenger contract should be deployed')
    }

    const rollup = await ethers.getContractAt('Rollup', deployedContracts.rollup)
    const withdrawal = await ethers.getContractAt('Withdrawal', deployedContracts.withdrawal)

    const zero = ethers.ZeroAddress
    const tx = await rollup.updateContractAddresses(deployedContracts.mockL2ScrollMessenger, zero, zero)
    console.log('Rollup.updateContractAddresses tx hash:', tx.hash)

    const tx2 = await withdrawal.updateContractAddresses(deployedContracts.mockL2ScrollMessenger, zero, zero, zero, zero)
    console.log('Withdrawal.updateContractAddresses tx hash:', tx2.hash)
}