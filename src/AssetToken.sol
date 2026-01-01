// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AssetToken is ERC20 {
    error InvalidAssetOwner();
    error InvalidTotalSupply();

    constructor(string memory name_, string memory symbol_, uint256 totalSupply_, address assetOwner_)
        ERC20(name_, symbol_)
    {
        if (assetOwner_ == address(0)) {
            revert InvalidAssetOwner();
        }
        if (totalSupply_ == 0) {
            revert InvalidTotalSupply();
        }
        _mint(assetOwner_, totalSupply_);
    }
}

