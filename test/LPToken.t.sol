// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LPToken.sol";

contract LPTokenTest is Test {
    LPToken lpToken;
    address pool = address(1);
    address user1 = address(2);
    address user2 = address(3);

    function setUp() public {
        lpToken = new LPToken("LP Token", "LP", pool);
    }

    // ============ Constructor Tests ============

    function test_Constructor_Success() public {
        assertEq(lpToken.name(), "LP Token");
        assertEq(lpToken.symbol(), "LP");
        assertEq(lpToken.pool(), pool);
        assertEq(lpToken.decimals(), 18);
    }

    function test_Constructor_RevertWhen_InvalidPool() public {
        vm.expectRevert(LPToken.Unauthorized.selector);
        new LPToken("LP Token", "LP", address(0));
    }

    // ============ mint Tests ============

    function test_Mint_Success() public {
        uint256 amount = 1000 ether;

        vm.prank(pool);
        lpToken.mint(user1, amount);

        assertEq(lpToken.balanceOf(user1), amount);
        assertEq(lpToken.totalSupply(), amount);
    }

    function test_Mint_Multiple() public {
        vm.prank(pool);
        lpToken.mint(user1, 1000 ether);

        vm.prank(pool);
        lpToken.mint(user2, 500 ether);

        assertEq(lpToken.balanceOf(user1), 1000 ether);
        assertEq(lpToken.balanceOf(user2), 500 ether);
        assertEq(lpToken.totalSupply(), 1500 ether);
    }

    function test_Mint_RevertWhen_NotPool() public {
        vm.prank(user1);
        vm.expectRevert(LPToken.Unauthorized.selector);
        lpToken.mint(user1, 1000 ether);
    }

    // ============ burn Tests ============

    function test_Burn_Success() public {
        uint256 mintAmount = 1000 ether;
        uint256 burnAmount = 300 ether;

        vm.prank(pool);
        lpToken.mint(user1, mintAmount);

        vm.prank(pool);
        lpToken.burn(user1, burnAmount);

        assertEq(lpToken.balanceOf(user1), mintAmount - burnAmount);
        assertEq(lpToken.totalSupply(), mintAmount - burnAmount);
    }

    function test_Burn_EntireBalance() public {
        uint256 amount = 1000 ether;

        vm.prank(pool);
        lpToken.mint(user1, amount);

        vm.prank(pool);
        lpToken.burn(user1, amount);

        assertEq(lpToken.balanceOf(user1), 0);
        assertEq(lpToken.totalSupply(), 0);
    }

    function test_Burn_RevertWhen_NotPool() public {
        vm.prank(pool);
        lpToken.mint(user1, 1000 ether);

        vm.prank(user1);
        vm.expectRevert(LPToken.Unauthorized.selector);
        lpToken.burn(user1, 500 ether);
    }

    // ============ ERC20 Functionality Tests ============

    function test_Transfer_Success() public {
        vm.prank(pool);
        lpToken.mint(user1, 1000 ether);

        vm.prank(user1);
        lpToken.transfer(user2, 300 ether);

        assertEq(lpToken.balanceOf(user1), 700 ether);
        assertEq(lpToken.balanceOf(user2), 300 ether);
    }

    function test_Approve_And_TransferFrom() public {
        vm.prank(pool);
        lpToken.mint(user1, 1000 ether);

        vm.prank(user1);
        lpToken.approve(user2, 500 ether);

        vm.prank(user2);
        lpToken.transferFrom(user1, user2, 300 ether);

        assertEq(lpToken.balanceOf(user1), 700 ether);
        assertEq(lpToken.balanceOf(user2), 300 ether);
        assertEq(lpToken.allowance(user1, user2), 200 ether);
    }
}

