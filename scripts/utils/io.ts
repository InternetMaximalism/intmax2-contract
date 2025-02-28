import { z } from 'zod'
import {
	DeployedContracts,
	DeployedContractsSchema,
} from '../schema/deployedContractsSchema'
import fs from 'fs-extra'
import { network } from 'hardhat'

const deployedContractPath = 'scripts/data/{networkName}-deployedContracts.json'

export async function readDeployedContracts(
	networkName: string = network.name,
): Promise<DeployedContracts> {
	const path = deployedContractPath.replace('{networkName}', networkName)
	try {
		const exists = await fs.pathExists(path)
		if (!exists) {
			await fs.writeJson(path, {}, { spaces: 2 })
			return {}
		}
		const data = await fs.readJson(path)
		return DeployedContractsSchema.parse(data)
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error('Validation error:', error.errors)
		} else {
			console.error('Error reading file:', error)
		}
		process.exit(1)
	}
}

export async function writeDeployedContracts(
	data: DeployedContracts,
	networkName: string = network.name,
): Promise<void> {
	const path = deployedContractPath.replace('{networkName}', networkName)
	try {
		const validatedUsers = DeployedContractsSchema.parse(data)
		await fs.writeJson(path, validatedUsers, { spaces: 4 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error('Validation error:', error.errors)
		} else {
			console.error('Error writing file:', error)
		}
	}
}
