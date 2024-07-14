import { ethers, upgrades, network } from 'hardhat'
import 'dotenv/config'
import contractAddresses from './contractAddresses.json'
import { saveJsonToFile } from './utils/saveJsonToFile'

const getL1MessengerAddress = () => {
	if (network.name === 'sepolia') {
		return '0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A'
	}
	if (network.name === 'localhost') {
		// provisional measures
		return ethers.ZeroAddress
	}
	//TODO mainnet messenger address
	throw new Error('Unsupported network')
}

const getUSDCAddress = () => {
	if (network.name === 'sepolia') {
		return '0xf08A50178dfcDe18524640EA6618a1f965821715'
	}
	if (network.name === 'localhost') {
		// provisional measures
		return '0x0000000000000000000000000000000000000001'
	}
	//TODO mainnet usdc address
	throw new Error('Unsupported network')
}

const getWBTCAddress = () => {
	if (network.name === 'sepolia') {
		return '0x92f3B59a79bFf5dc60c0d59eA13a44D082B2bdFC'
	}
	if (network.name === 'localhost') {
		// provisional measures
		return '0x0000000000000000000000000000000000000002'
	}
	//TODO mainnet usdc address
	throw new Error('Unsupported network')
}

async function main() {
	const rollupContractAddress = contractAddresses.rollup
	if (!rollupContractAddress) {
		throw new Error('rollupContractAddress is not set')
	}

	const liquidityFactory = await ethers.getContractFactory('Liquidity')
	const liquidity = await upgrades.deployProxy(
		liquidityFactory,
		[
			getL1MessengerAddress(),
			rollupContractAddress,
			getUSDCAddress(),
			getWBTCAddress(),
		],
		{
			kind: 'uups',
		},
	)
	const liquidityAddress = await liquidity.getAddress()
	console.log('Liquidity deployed to:', liquidityAddress)

	const newContractAddresses = {
		...contractAddresses,
		liquidity: liquidityAddress,
	}

	saveJsonToFile(
		'./scripts/contractAddresses.json',
		JSON.stringify(newContractAddresses, null, 2),
	)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
