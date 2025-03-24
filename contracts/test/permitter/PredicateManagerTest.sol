// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;
import {Task} from "@predicate/contracts/src/interfaces/IPredicateManager.sol";

contract PredicateManagerTest {
	bool public result;

	function setResult(bool _result) external {
		result = _result;
	}

	function validateSignatures(
		Task memory,
		address[] memory,
		bytes[] memory
	) external view returns (bool isVerified) {
		return result;
	}
}
