import { ethers, network } from 'hardhat'
import { readDeployedContracts } from './io'

export const getUSDCAddress = () => {
	if (network.name === 'sepolia') {
		return '0xf08A50178dfcDe18524640EA6618a1f965821715'
	}
	if (network.name === 'localhost') {
		// provisional measures
		return '0x0000000000000000000000000000000000000001'
	}
	if (network.name === 'mainnet') {
		return '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
	}
	//TODO mainnet usdc address
	throw new Error('Unsupported network')
}

export const getWBTCAddress = () => {
	if (network.name === 'sepolia') {
		return '0x92f3B59a79bFf5dc60c0d59eA13a44D082B2bdFC'
	}
	if (network.name === 'localhost') {
		// provisional measures
		return '0x0000000000000000000000000000000000000002'
	}
	if (network.name === 'mainnet') {
		return '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
	}
	//TODO mainnet usdc address
	throw new Error('Unsupported network')
}

export const getL1MessengerAddress = async () => {
	if (network.name === 'sepolia') {
		const deployedContracts = await readDeployedContracts()
		if (!deployedContracts.mockL1ScrollMessenger) {
			return '0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A' // real address
		} else {
			return deployedContracts.mockL1ScrollMessenger
		}
	}
	if (network.name === 'mainnet') {
		return '0x6774bcbd5cecef1336b5300fb5186a12ddd8b367'
	}

	if (network.name === 'localhost') {
		// provisional measures
		return ethers.ZeroAddress
	}
	//TODO mainnet messenger address
	throw new Error('Unsupported network')
}

export const getL2MessengerAddress = async () => {
	if (network.name === 'scrollSepolia') {
		const deployedContracts = await readDeployedContracts()
		if (!deployedContracts.mockL2ScrollMessenger) {
			return '0xBa50f5340FB9F3Bd074bD638c9BE13eCB36E603d' // real address
		} else {
			return deployedContracts.mockL2ScrollMessenger // mock address
		}
	}
	if (network.name === 'scroll') {
		return '0x781e90f1c8Fc4611c9b7497C3B47F99Ef6969CbC'
	}
	if (network.name === 'localhost') {
		// provisional measures
		return ethers.ZeroAddress
	}

	//TODO scroll messenger address
	throw new Error('Unsupported network')
}
