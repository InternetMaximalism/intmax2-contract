import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import 'dotenv/config'
import { cleanEnv, str } from 'envalid'
import 'solidity-docgen'
import 'hardhat-gas-reporter'

const env = cleanEnv(process.env, {
	DEPLOYER_PRIVATE_KEY: str(),
	ANALYZER_PRIVATE_KEY: str(),
	ALCHEMY_KEY: str(),
})

const accounts = [env.DEPLOYER_PRIVATE_KEY, env.ANALYZER_PRIVATE_KEY]

const config: HardhatUserConfig = {
	solidity: '0.8.24',
	gasReporter: {
		enabled: true,
		currency: 'USD',
	},
	networks: {
		sepolia: {
			// url: "https://1rpc.io/sepolia",
			url: `https://eth-sepolia.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		arbitrum: {
			url: `https://arb-mainnet.g.alchemy.com/v2/${env.ALCHEMY_KEY}`,
			accounts,
		},
		scrollSepolia: {
			// url: 'https://sepolia-rpc.scroll.io/',
			url: 'https://scroll-testnet.rpc.grove.city/v1/a7a7c8e2',
			accounts,
		},
	},
	docgen: {
		exclude: ['test'],
	},
}

export default config
