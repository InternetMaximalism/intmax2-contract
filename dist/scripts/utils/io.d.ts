import { DeployedContracts } from '../schema/deployedContractsSchema';
export declare function readDeployedContracts(networkName?: string): Promise<DeployedContracts>;
export declare function writeDeployedContracts(data: DeployedContracts, networkName?: string): Promise<void>;
