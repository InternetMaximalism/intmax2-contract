"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDeployedContracts = readDeployedContracts;
exports.writeDeployedContracts = writeDeployedContracts;
const zod_1 = require("zod");
const deployedContractsSchema_1 = require("../schema/deployedContractsSchema");
const fs_extra_1 = __importDefault(require("fs-extra"));
const hardhat_1 = require("hardhat");
const path_1 = __importDefault(require("path"));
const deployedContractPath = 'deployments/{networkName}-deployedContracts.json';
async function readDeployedContracts(networkName = hardhat_1.network.name) {
    const filePath = deployedContractPath.replace('{networkName}', networkName);
    try {
        const exists = await fs_extra_1.default.pathExists(filePath);
        if (!exists) {
            await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
            await fs_extra_1.default.writeJson(filePath, {}, { spaces: 2 });
            return {};
        }
        const data = await fs_extra_1.default.readJson(filePath);
        return deployedContractsSchema_1.DeployedContractsSchema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('Validation error:', error.errors);
        }
        else {
            console.error('Error reading file:', error);
        }
        process.exit(1);
    }
}
async function writeDeployedContracts(data, networkName = hardhat_1.network.name) {
    const filePath = deployedContractPath.replace('{networkName}', networkName);
    try {
        await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
        const validatedUsers = deployedContractsSchema_1.DeployedContractsSchema.parse(data);
        await fs_extra_1.default.writeJson(filePath, validatedUsers, { spaces: 4 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('Validation error:', error.errors);
        }
        else {
            console.error('Error writing file:', error);
        }
    }
}
