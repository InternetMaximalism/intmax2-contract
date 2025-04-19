// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;
import {PredicatePermitter} from "../../permitter/PredicatePermitter.sol";
import {PredicateMessage} from "@predicate/contracts/src/interfaces/IPredicateClient.sol";

contract PredicatePermitter2 is PredicatePermitter {
	event LatestPermitResult(bool latestPermitResult);

	// This function is used to test the permit function without the onlyLiquidity modifier
	function permitOverride(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external {
		// We need to set the contract itself as the liquidity address temporarily
		address originalLiquidity = liquidity;
		liquidity = address(this);

		// Now call permit directly - this will work because the contract is now set as liquidity
		PredicateMessage memory predicateMessage = abi.decode(
			permission,
			(PredicateMessage)
		);
		bool latestPermitResult = _authorizeTransaction(
			predicateMessage,
			encodedData,
			user,
			value
		);

		// Restore the original liquidity address
		liquidity = originalLiquidity;

		emit LatestPermitResult(latestPermitResult);
	}

	// This function is used to test the onlyLiquidity modifier
	function setLiquidityAddress(address _liquidity) external {
		liquidity = _liquidity;
	}

	// This function is used to get the current liquidity address
	function getLiquidityAddress() external view returns (address) {
		return liquidity;
	}
}
