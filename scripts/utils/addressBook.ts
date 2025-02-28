import { ethers, network } from 'hardhat'
import { readDeployedContracts } from './io'

export const getL1MessengerAddress = async () => {
	if (network.name === 'sepolia') {
		return '0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A' // real address
	}
	const deployedContracts = await readDeployedContracts()
	if (deployedContracts.mockL1ScrollMessenger) {
		return deployedContracts.mockL1ScrollMessenger
	}
	//TODO mainnet messenger address
	throw new Error('Unsupported network')
}

export const getL2MessengerAddress = async () => {
	if (network.name === 'scrollSepolia') {
		return '0xBa50f5340FB9F3Bd074bD638c9BE13eCB36E603d' // real address
	}
	const deployedContracts = await readDeployedContracts()
	if (deployedContracts.mockL2ScrollMessenger) {
		return deployedContracts.mockL2ScrollMessenger
	}
	//TODO scroll messenger address
	throw new Error('Unsupported network')
}
