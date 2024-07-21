import fs from 'fs'
import { ethers } from 'hardhat'

export function loadWithdrawalInfo(): WithdrawalInfo {
	const data = fs.readFileSync(`test_data/withdrawal_info.json`, 'utf8')
	const jsonData = JSON.parse(data) as WithdrawalInfo
	return jsonData
}

export function makeWithdrawalInfo(
	aggregator: string,
	withdrawals: Withdrawal[],
): WithdrawalInfo {
	let hash = ethers.ZeroHash
	for (const withdrawal of withdrawals) {
		hash = hashWithdrawalWithPrevHash(hash, withdrawal)
	}
	const pis = {
		lastWithdrawalHash: hash,
		withdrawalAggregator: aggregator,
	}
	const pisHash = hashWithdrawalPis(pis)
	return {
		withdrawals,
		withdrawalProofPublicInputs: pis,
		pisHash,
	}
}

function hashWithdrawalWithPrevHash(
	prevHash: string,
	withdrawal: Withdrawal,
): string {
	return ethers.solidityPackedKeccak256(
		['bytes32', 'address', 'uint32', 'uint256', 'bytes32', 'bytes32', 'uint32'],
		[
			prevHash,
			withdrawal.recipient,
			withdrawal.tokenIndex,
			withdrawal.amount,
			withdrawal.nullifier,
			withdrawal.blockHash,
			withdrawal.blockNumber,
		],
	)
}

function hashWithdrawalPis(pis: WithdrawalProofPublicInputs): string {
	return ethers.solidityPackedKeccak256(
		['bytes32', 'address'],
		[pis.lastWithdrawalHash, pis.withdrawalAggregator],
	)
}
