// SPDX-License-Identifier: MIT
// solhint-disable reason-string
// solhint-disable gas-custom-errors

pragma solidity 0.8.24;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

// Removed trasnfer and transferFrom return values.
contract TestTokenUSDT is Context {
	mapping(address account => uint256) private _balances;

	mapping(address account => mapping(address spender => uint256))
		private _allowances;

	uint256 private _totalSupply;

	string private _name;
	string private _symbol;

	constructor(string memory name_, string memory symbol_) {
		_name = name_;
		_symbol = symbol_;
		_mint(_msgSender(), 1000000000000000000000000);
	}

	function name() public view returns (string memory) {
		return _name;
	}

	function symbol() public view returns (string memory) {
		return _symbol;
	}

	function decimals() public pure returns (uint8) {
		return 18;
	}

	function totalSupply() public view returns (uint256) {
		return _totalSupply;
	}

	function balanceOf(address account) public view returns (uint256) {
		return _balances[account];
	}

	function transfer(address to, uint256 value) public {
		address owner = _msgSender();
		_transfer(owner, to, value);
	}

	function allowance(
		address owner,
		address spender
	) public view returns (uint256) {
		return _allowances[owner][spender];
	}

	function approve(address spender, uint256 value) public returns (bool) {
		address owner = _msgSender();
		_approve(owner, spender, value);
		return true;
	}

	function transferFrom(address from, address to, uint256 value) public {
		address spender = _msgSender();
		_spendAllowance(from, spender, value);
		_transfer(from, to, value);
	}

	function _transfer(address from, address to, uint256 value) internal {
		if (from == address(0)) {
			revert();
		}
		if (to == address(0)) {
			revert();
		}
		_update(from, to, value);
	}

	function _update(address from, address to, uint256 value) internal {
		if (from == address(0)) {
			// Overflow check required: The rest of the code assumes that totalSupply never overflows
			_totalSupply += value;
		} else {
			uint256 fromBalance = _balances[from];
			if (fromBalance < value) {
				revert();
			}
			unchecked {
				// Overflow not possible: value <= fromBalance <= totalSupply.
				_balances[from] = fromBalance - value;
			}
		}

		if (to == address(0)) {
			unchecked {
				// Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
				_totalSupply -= value;
			}
		} else {
			unchecked {
				// Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
				_balances[to] += value;
			}
		}
	}

	function _mint(address account, uint256 value) internal {
		if (account == address(0)) {
			revert();
		}
		_update(address(0), account, value);
	}

	function _burn(address account, uint256 value) internal {
		if (account == address(0)) {
			revert();
		}
		_update(account, address(0), value);
	}

	function _approve(address owner, address spender, uint256 value) internal {
		_approve(owner, spender, value, true);
	}

	function _approve(
		address owner,
		address spender,
		uint256 value,
		bool
	) internal {
		if (owner == address(0)) {
			revert();
		}
		if (spender == address(0)) {
			revert();
		}
		_allowances[owner][spender] = value;
	}

	function _spendAllowance(
		address owner,
		address spender,
		uint256 value
	) internal {
		uint256 currentAllowance = allowance(owner, spender);
		if (currentAllowance != type(uint256).max) {
			if (currentAllowance < value) {
				revert();
			}
			unchecked {
				_approve(owner, spender, currentAllowance - value, false);
			}
		}
	}
}
