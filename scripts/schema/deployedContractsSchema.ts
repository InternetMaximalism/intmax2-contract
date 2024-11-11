import { z } from 'zod'

const ethereumAddressSchema = z
	.string()
	.regex(/^0x[a-fA-F0-9]{40}$/, {
		message:
			"Invalid Ethereum address format. Must start with '0x' followed by 40 hexadecimal characters.",
	})
	.describe('Ethereum address')

export const DeployedContractsSchema = z
	.object({
		mockL1ScrollMessenger: ethereumAddressSchema.describe(
			'Mock L1 scroll messenger contract address',
		),
		mockL2ScrollMessenger: ethereumAddressSchema.describe(
			'Mock L2 scroll messenger contract address',
		),
		l1Contribution: ethereumAddressSchema.describe(
			'L1 contribution contract address',
		),
		l2Contribution: ethereumAddressSchema.describe(
			'L2 contribution contract address',
		),
		testErc20: ethereumAddressSchema.describe('Test ERC20 contract address'),
		withdrawalPlonkVerifier: ethereumAddressSchema.describe(
			'PLONK verifier for withdrawal contract address',
		),
		rollup: ethereumAddressSchema.describe('Rollup contract address'),
		withdrawal: ethereumAddressSchema.describe('Withdrawal contract address'),
		blockBuilderRegistry: ethereumAddressSchema.describe(
			'Block builder registry contract address',
		),
		liquidity: ethereumAddressSchema.describe('Liquidity contract address'),
	})
	.partial()

export type DeployedContracts = z.infer<typeof DeployedContractsSchema>
