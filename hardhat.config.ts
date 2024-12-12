import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import 'dotenv/config'
import { cleanEnv, str } from 'envalid'
import 'solidity-docgen'
import 'hardhat-gas-reporter'

const env = cleanEnv(process.env, {
	DEPLOYER_PRIVATE_KEY: str(),
	ALCHEMY_KEY: str(),
	ETHERSCAN_API_KEY: str(),
	SCROLLSCAN_API_KEY: str(),
})

const accounts = [env.DEPLOYER_PRIVATE_KEY]

const config: HardhatUserConfig = {
	solidity: '0.8.27',
	gasReporter: {
		enabled: true,
		currency: 'USD',
	},
	networks: {
		sepolia: {
			url: `https://eth-sepolia.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		arbitrum: {
			url: `https://arb-mainnet.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		scrollSepolia: {
			url: `https://scroll-sepolia.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
	},
	docgen: {
		exclude: ['test'],
	},
	etherscan: {
		apiKey: {
			sepolia: env.ETHERSCAN_API_KEY,
			scrollSepolia: env.SCROLLSCAN_API_KEY,
		},
		customChains: [
			{
				network: 'scrollSepolia',
				chainId: 534351,
				urls: {
					apiURL: 'https://api-sepolia.scrollscan.com/api',
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
