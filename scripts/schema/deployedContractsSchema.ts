import { z } from 'zod'

const ethereumAddressSchema = z
	.string()
	.regex(/^0x[a-fA-F0-9]{40}$/, {
		message:
			"Invalid Ethereum address format. Must start with '0x' followed by 40 hexadecimal characters.",
	})
	.describe('Ethereum address')

const deployedContractsSchema = z
	.object({
		testErc20: ethereumAddressSchema.describe('Test ERC20 contract address'),
		withdrawalPlonkVerifier: ethereumAddressSchema.describe(
			'PLONK verifier for withdrawal contract address',
		),
		fraudPlonkVerifier: ethereumAddressSchema.describe(
			'PLONK verifier for fraud proof contract address',
		),
		rollup: ethereumAddressSchema.describe('Rollup contract address'),
		withdrawal: ethereumAddressSchema.describe('Withdrawal contract address'),
		blockBuilderRegistry: ethereumAddressSchema.describe(
			'Block builder registry contract address',
		),
		liquidity: ethereumAddressSchema.describe('Liquidity contract address'),
	})
	.partial()

type DeployedContracts = z.infer<typeof deployedContractsSchema>
