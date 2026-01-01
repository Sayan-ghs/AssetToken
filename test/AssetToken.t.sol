// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetToken.sol";

contract AssetTokenTest is Test {
    AssetToken assetToken;

    address owner = address(1);
    address user = address(2);

    // Runs before every test
    function setUp() public {
        assetToken = new AssetToken(
            "Land Token",
            "LAND",
            1000000 ether, // totalSupply
            owner // assetOwner
        );
    }

    function test_Deployment_Success() public {
        assertEq(assetToken.name(), "Land Token");
        assertEq(assetToken.symbol(), "LAND");
        assertEq(assetToken.totalSupply(), 1000000 ether);
        assertEq(assetToken.balanceOf(owner), 1000000 ether);
        assertEq(assetToken.decimals(), 18);
    }

    function test_Deployment_RevertWhen_InvalidAssetOwner() public {
        vm.expectRevert(AssetToken.InvalidAssetOwner.selector);
        new AssetToken("Test Token", "TEST", 1000 ether, address(0));
    }

    function test_Deployment_RevertWhen_InvalidTotalSupply() public {
        vm.expectRevert(AssetToken.InvalidTotalSupply.selector);
        new AssetToken("Test Token", "TEST", 0, owner);
    }

    function test_Transfer_Success() public {
        uint256 transferAmount = 1000 ether;

        vm.prank(owner);
        assetToken.transfer(user, transferAmount);

        assertEq(assetToken.balanceOf(owner), 1000000 ether - transferAmount);
        assertEq(assetToken.balanceOf(user), transferAmount);
    }

    function test_Transfer_EntireBalance() public {
        vm.prank(owner);
        assetToken.transfer(user, 1000000 ether);

        assertEq(assetToken.balanceOf(owner), 0);
        assertEq(assetToken.balanceOf(user), 1000000 ether);
    }

    function test_Transfer_InsufficientBalance() public {
        vm.prank(user);
        vm.expectRevert();
        assetToken.transfer(owner, 1 ether);
    }
}
