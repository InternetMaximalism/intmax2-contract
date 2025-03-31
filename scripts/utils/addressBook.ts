import { network } from 'hardhat'
import { readDeployedContracts } from './io'

export const getL1MessengerAddress = async () => {
	// Get mock l1 messenger address from deployed contracts
	const deployedContracts = await readDeployedContracts()
	if (deployedContracts.mockL1ScrollMessenger) {
		return deployedContracts.mockL1ScrollMessenger
	}
	if (network.name === 'sepolia') {
		return '0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A'
	}
	if (network.name === 'mainnet') {
		return '0x6774Bcbd5ceCeF1336b5300fb5186a12DDD8b367'
	}
	throw new Error('Unsupported network')
}

export const getL2MessengerAddress = async () => {
	// Get mock l2 messenger address from deployed contracts
	const deployedContracts = await readDeployedContracts()
	if (deployedContracts.mockL2ScrollMessenger) {
		return deployedContracts.mockL2ScrollMessenger
	}
	if (network.name === 'scrollSepolia') {
		return '0xBa50f5340FB9F3Bd074bD638c9BE13eCB36E603d'
	}
	if (network.name === 'scroll') {
		return '0x781e90f1c8Fc4611c9b7497C3B47F99Ef6969CbC'
	}
	throw new Error('Unsupported network')
}
