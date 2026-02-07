import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import 'dotenv/config'
import { cleanEnv, str } from 'envalid'
import 'solidity-docgen'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

const env = cleanEnv(process.env, {
	DEPLOYER_PRIVATE_KEY: str(),
	ALCHEMY_KEY: str(),
	ETHERSCAN_API_KEY: str(),
})

const accounts = [env.DEPLOYER_PRIVATE_KEY]

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.27',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	gasReporter: {
		enabled: true,
		currency: 'USD',
	},
	networks: {
		mainnet: {
			url: `https://eth-mainnet.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		scroll: {
			url: `https://scroll-mainnet.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		sepolia: {
			url: `https://eth-sepolia.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		scrollSepolia: {
			url: `https://scroll-sepolia.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		holesky: {
			url: `https://eth-holesky.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
	},
	docgen: {
		exclude: ['test'],
	},
	etherscan: {
		apiKey: env.ETHERSCAN_API_KEY,
		customChains: [
			{
				network: 'scroll',
				chainId: 534352,
				urls: {
					apiURL: 'https://api.etherscan.io/v2/api?chainid=534352',
					browserURL: 'https://scrollscan.com/',
				},
			},
			{
				network: 'scrollSepolia',
				chainId: 534351,
				urls: {
					apiURL: 'https://api.etherscan.io/v2/api?chainid=534351',
					browserURL: 'https://sepolia.scrollscan.com/',
				},
			},
		],
	},
	sourcify: {
		enabled: false,
	},
}

export default config
