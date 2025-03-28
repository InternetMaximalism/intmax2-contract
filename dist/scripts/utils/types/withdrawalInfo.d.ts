export interface WithdrawalInfo {
    withdrawals: Withdrawal[];
    withdrawalProofPublicInputs: WithdrawalProofPublicInputs;
    pisHash: string;
}
export interface Withdrawal {
    recipient: string;
    tokenIndex: number;
    amount: string;
    nullifier: string;
    blockHash: string;
    blockNumber: number;
}
export interface WithdrawalProofPublicInputs {
    lastWithdrawalHash: string;
    withdrawalAggregator: string;
}
