// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;
import {PredicatePermitter} from "../../permitter/PredicatePermitter.sol";

contract PredicatePermitter2 is PredicatePermitter {
	event LatestPermitResult(bool latestPermitResult);

	function permitOverride(
		address user,
		uint256 value,
		bytes calldata encodedData,
		bytes calldata permission
	) external {
		bool latestPermitResult = this.permit(
			user,
			value,
			encodedData,
			permission
		);
		emit LatestPermitResult(latestPermitResult);
	}
}
