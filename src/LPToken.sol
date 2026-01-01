// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken is ERC20 {
    address public pool;

    error Unauthorized();

    constructor(string memory name_, string memory symbol_, address pool_) ERC20(name_, symbol_) {
        if (pool_ == address(0)) {
            revert Unauthorized();
        }
        pool = pool_;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != pool) {
            revert Unauthorized();
        }
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != pool) {
            revert Unauthorized();
        }
        _burn(from, amount);
    }
}

