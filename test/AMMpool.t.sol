// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AMMPool.sol";
import "../src/AssetToken.sol";

contract AMMPoolTest is Test {
    AMMPool pool;
    AssetToken token;

    address provider1 = address(1);
    address provider2 = address(2);
    address swapper = address(3);

    function setUp() public {
        vm.prank(provider1);
        token = new AssetToken("Test Token", "TEST", 100000 ether, provider1);

        pool = new AMMPool(address(token));

        // Approve pool to spend tokens
        vm.prank(provider1);
        token.approve(address(pool), type(uint256).max);
    }

    // ============ Constructor Tests ============

    function test_Constructor_Success() public {
        assertEq(pool.token(), address(token));
        assertEq(pool.reserveToken(), 0);
        assertEq(pool.reserveETH(), 0);
        assertEq(pool.totalSupply(), 0);
    }

    function test_Constructor_RevertWhen_InvalidToken() public {
        vm.expectRevert(AMMPool.InvalidToken.selector);
        new AMMPool(address(0));
    }

    // ============ addLiquidity Tests ============

    function test_AddLiquidity_InitialLiquidity() public {
        uint256 tokenAmount = 1000 ether;
        uint256 ethAmount = 1 ether;

        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        assertEq(pool.reserveToken(), tokenAmount);
        assertEq(pool.reserveETH(), ethAmount);
        assertGt(pool.totalSupply(), 0);
        assertEq(pool.balanceOf(provider1), pool.totalSupply());
    }

    function test_AddLiquidity_SubsequentLiquidity() public {
        // Initial liquidity
        uint256 tokenAmount1 = 1000 ether;
        uint256 ethAmount1 = 1 ether;
        vm.deal(provider1, ethAmount1);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount1}(tokenAmount1, 0, 0);

        uint256 initialSupply = pool.totalSupply();

        // Second liquidity provider - need to give them tokens first
        vm.prank(provider1);
        token.transfer(provider2, 500 ether);
        
        vm.prank(provider2);
        token.approve(address(pool), type(uint256).max);
        vm.deal(provider2, 1 ether);

        uint256 tokenAmount2 = 500 ether;
        uint256 ethAmount2 = 0.5 ether;
        vm.prank(provider2);
        pool.addLiquidity{value: ethAmount2}(tokenAmount2, 0, 0);

        // Should maintain ratio
        assertGt(pool.totalSupply(), initialSupply);
        assertGt(pool.balanceOf(provider2), 0);
    }

    function test_AddLiquidity_Event() public {
        uint256 tokenAmount = 1000 ether;
        uint256 ethAmount = 1 ether;
        vm.deal(provider1, ethAmount);

        // Calculate expected liquidity: sqrt(tokenAmount * ethAmount) for initial liquidity
        uint256 expectedLiquidity = _sqrt(tokenAmount * ethAmount);

        vm.prank(provider1);
        vm.expectEmit(true, false, false, true);
        emit AMMPool.LiquidityAdded(provider1, tokenAmount, ethAmount, expectedLiquidity);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function test_AddLiquidity_RevertWhen_InvalidAmounts() public {
        vm.deal(provider1, 1 ether);
        vm.prank(provider1);
        vm.expectRevert(AMMPool.InvalidAmounts.selector);
        pool.addLiquidity{value: 0}(1000 ether, 0, 0);

        vm.prank(provider1);
        vm.expectRevert(AMMPool.InvalidAmounts.selector);
        pool.addLiquidity{value: 1 ether}(0, 0, 0);
    }

    function test_AddLiquidity_RevertWhen_MinAmountsNotMet() public {
        // Initial liquidity
        uint256 tokenAmount1 = 1000 ether;
        uint256 ethAmount1 = 1 ether;
        vm.deal(provider1, ethAmount1);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount1}(tokenAmount1, 0, 0);

        // Try to add with too high min amounts
        vm.deal(provider2, 1 ether);
        vm.prank(provider2);
        token.approve(address(pool), type(uint256).max);
        vm.expectRevert(AMMPool.InsufficientAmount.selector);
        pool.addLiquidity{value: 0.5 ether}(500 ether, 600 ether, 0.6 ether);
    }

    // ============ removeLiquidity Tests ============

    function test_RemoveLiquidity_Success() public {
        // Add liquidity first
        uint256 tokenAmount = 1000 ether;
        uint256 ethAmount = 1 ether;
        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        uint256 liquidity = pool.balanceOf(provider1);
        uint256 tokenBalanceBefore = token.balanceOf(provider1);
        uint256 ethBalanceBefore = provider1.balance;

        vm.prank(provider1);
        pool.removeLiquidity(liquidity / 2, 0, 0);

        assertLt(pool.balanceOf(provider1), liquidity);
        assertGt(token.balanceOf(provider1), tokenBalanceBefore);
        assertGt(provider1.balance, ethBalanceBefore);
    }

    function test_RemoveLiquidity_RevertWhen_InvalidAmounts() public {
        vm.prank(provider1);
        vm.expectRevert(AMMPool.InvalidAmounts.selector);
        pool.removeLiquidity(0, 0, 0);
    }

    function test_RemoveLiquidity_RevertWhen_InsufficientLiquidity() public {
        vm.prank(provider1);
        vm.expectRevert(AMMPool.InsufficientLiquidityBurned.selector);
        pool.removeLiquidity(1, 0, 0);
    }

    // ============ swapETHForTokens Tests ============

    function test_SwapETHForTokens_Success() public {
        // Add liquidity first
        uint256 tokenAmount = 10000 ether;
        uint256 ethAmount = 10 ether;
        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        uint256 ethIn = 1 ether;
        uint256 tokensOut = pool.getAmountOut(ethIn, true);
        uint256 tokenBalanceBefore = token.balanceOf(swapper);

        vm.deal(swapper, ethIn);
        vm.prank(swapper);
        pool.swapETHForTokens{value: ethIn}(0);

        assertGt(token.balanceOf(swapper), tokenBalanceBefore);
        assertEq(token.balanceOf(swapper) - tokenBalanceBefore, tokensOut);
    }

    function test_SwapETHForTokens_RevertWhen_InvalidAmounts() public {
        vm.prank(swapper);
        vm.expectRevert(AMMPool.InvalidAmounts.selector);
        pool.swapETHForTokens{value: 0}(0);
    }

    function test_SwapETHForTokens_RevertWhen_InsufficientLiquidity() public {
        vm.deal(swapper, 1 ether);
        vm.prank(swapper);
        vm.expectRevert(AMMPool.InsufficientLiquidity.selector);
        pool.swapETHForTokens{value: 1 ether}(0);
    }

    function test_SwapETHForTokens_RevertWhen_InsufficientOutput() public {
        // Add liquidity
        uint256 tokenAmount = 10000 ether;
        uint256 ethAmount = 10 ether;
        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        vm.deal(swapper, 1 ether);
        uint256 minTokensOut = pool.getAmountOut(1 ether, true) + 1;
        vm.prank(swapper);
        vm.expectRevert(AMMPool.InsufficientOutput.selector);
        pool.swapETHForTokens{value: 1 ether}(minTokensOut);
    }

    // ============ swapTokensForETH Tests ============

    function test_SwapTokensForETH_Success() public {
        // Add liquidity
        uint256 tokenAmount = 10000 ether;
        uint256 ethAmount = 10 ether;
        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        // Give swapper tokens
        vm.prank(provider1);
        token.transfer(swapper, 1000 ether);

        vm.prank(swapper);
        token.approve(address(pool), type(uint256).max);
        vm.deal(swapper, 0);

        uint256 tokensIn = 1000 ether;
        uint256 ethOut = pool.getAmountOut(tokensIn, false);
        uint256 ethBalanceBefore = swapper.balance;

        vm.prank(swapper);
        pool.swapTokensForETH(tokensIn, 0);

        assertGt(swapper.balance, ethBalanceBefore);
        assertEq(swapper.balance - ethBalanceBefore, ethOut);
    }

    function test_SwapTokensForETH_RevertWhen_InvalidAmounts() public {
        vm.prank(swapper);
        vm.expectRevert(AMMPool.InvalidAmounts.selector);
        pool.swapTokensForETH(0, 0);
    }

    // ============ getAmountOut Tests ============

    function test_GetAmountOut_ETHIn() public {
        // Add liquidity
        uint256 tokenAmount = 10000 ether;
        uint256 ethAmount = 10 ether;
        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        uint256 amountOut = pool.getAmountOut(1 ether, true);
        assertGt(amountOut, 0);
        assertLt(amountOut, 1000 ether); // Should be less than 1:1 due to fees
    }

    function test_GetAmountOut_TokensIn() public {
        // Add liquidity
        uint256 tokenAmount = 10000 ether;
        uint256 ethAmount = 10 ether;
        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        uint256 amountOut = pool.getAmountOut(1000 ether, false);
        assertGt(amountOut, 0);
        assertLt(amountOut, 1 ether); // Should be less than 1:1 due to fees
    }

    function test_GetAmountOut_ZeroWhenNoLiquidity() public {
        assertEq(pool.getAmountOut(1 ether, true), 0);
        assertEq(pool.getAmountOut(1000 ether, false), 0);
    }

    // ============ getReserves Tests ============

    function test_GetReserves() public {
        uint256 tokenAmount = 1000 ether;
        uint256 ethAmount = 1 ether;
        vm.deal(provider1, ethAmount);
        vm.prank(provider1);
        pool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);

        (uint256 reserveToken, uint256 reserveETH) = pool.getReserves();
        assertEq(reserveToken, tokenAmount);
        assertEq(reserveETH, ethAmount);
    }
}

