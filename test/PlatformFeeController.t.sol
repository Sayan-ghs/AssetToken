// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PlatformFeeController.sol";
import "../src/AssetToken.sol";

contract PlatformFeeControllerTest is Test {
    PlatformFeeController feeController;
    AssetToken token;

    address owner = address(1);
    address feeRecipient = address(2);
    address user = address(3);
    address exemptUser = address(4);

    function setUp() public {
        vm.prank(owner);
        feeController = new PlatformFeeController(feeRecipient);

        vm.prank(owner);
        token = new AssetToken("Test Token", "TEST", 10000 ether, owner);
    }

    // ============ Constructor Tests ============

    function test_Constructor_Success() public {
        assertEq(feeController.feeRecipient(), feeRecipient);
        assertEq(feeController.primarySaleFeeBPS(), 100);
        assertEq(feeController.ammSwapFeeBPS(), 50);
        assertEq(feeController.liquidityFeeBPS(), 25);
    }

    function test_Constructor_RevertWhen_InvalidFeeRecipient() public {
        vm.expectRevert(PlatformFeeController.InvalidFeeRecipient.selector);
        new PlatformFeeController(address(0));
    }

    // ============ setPrimarySaleFee Tests ============

    function test_SetPrimarySaleFee_Success() public {
        vm.prank(owner);
        feeController.setPrimarySaleFee(200);

        assertEq(feeController.primarySaleFeeBPS(), 200);
    }

    function test_SetPrimarySaleFee_Event() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit PlatformFeeController.PrimarySaleFeeSet(100, 200);
        feeController.setPrimarySaleFee(200);
    }

    function test_SetPrimarySaleFee_RevertWhen_ExceedsMaximum() public {
        vm.prank(owner);
        vm.expectRevert(PlatformFeeController.FeeExceedsMaximum.selector);
        feeController.setPrimarySaleFee(1001);
    }

    function test_SetPrimarySaleFee_RevertWhen_NotOwner() public {
        vm.prank(user);
        vm.expectRevert();
        feeController.setPrimarySaleFee(200);
    }

    // ============ setAMMSwapFee Tests ============

    function test_SetAMMSwapFee_Success() public {
        vm.prank(owner);
        feeController.setAMMSwapFee(75);

        assertEq(feeController.ammSwapFeeBPS(), 75);
    }

    function test_SetAMMSwapFee_RevertWhen_ExceedsMaximum() public {
        vm.prank(owner);
        vm.expectRevert(PlatformFeeController.FeeExceedsMaximum.selector);
        feeController.setAMMSwapFee(1001);
    }

    // ============ setLiquidityFee Tests ============

    function test_SetLiquidityFee_Success() public {
        vm.prank(owner);
        feeController.setLiquidityFee(30);

        assertEq(feeController.liquidityFeeBPS(), 30);
    }

    // ============ setFeeRecipient Tests ============

    function test_SetFeeRecipient_Success() public {
        address newRecipient = address(5);
        vm.prank(owner);
        feeController.setFeeRecipient(newRecipient);

        assertEq(feeController.feeRecipient(), newRecipient);
    }

    function test_SetFeeRecipient_Event() public {
        address newRecipient = address(5);
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit PlatformFeeController.FeeRecipientSet(feeRecipient, newRecipient);
        feeController.setFeeRecipient(newRecipient);
    }

    function test_SetFeeRecipient_RevertWhen_InvalidRecipient() public {
        vm.prank(owner);
        vm.expectRevert(PlatformFeeController.InvalidFeeRecipient.selector);
        feeController.setFeeRecipient(address(0));
    }

    // ============ setFeeExempt Tests ============

    function test_SetFeeExempt_Success() public {
        vm.prank(owner);
        feeController.setFeeExempt(exemptUser, true);

        assertTrue(feeController.feeExempt(exemptUser));
    }

    function test_SetFeeExempt_Event() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit PlatformFeeController.FeeExemptUpdated(exemptUser, true);
        feeController.setFeeExempt(exemptUser, true);
    }

    // ============ calculatePrimarySaleFee Tests ============

    function test_CalculatePrimarySaleFee_NormalUser() public {
        uint256 amount = 1000 ether;
        uint256 expectedFee = (amount * 100) / 10000; // 1%

        uint256 fee = feeController.calculatePrimarySaleFee(amount);
        assertEq(fee, expectedFee);
    }

    function test_CalculatePrimarySaleFee_ExemptUser() public {
        vm.prank(owner);
        feeController.setFeeExempt(exemptUser, true);

        vm.prank(exemptUser);
        uint256 fee = feeController.calculatePrimarySaleFee(1000 ether);
        assertEq(fee, 0);
    }

    // ============ calculateAMMSwapFee Tests ============

    function test_CalculateAMMSwapFee_NormalUser() public {
        uint256 amount = 1000 ether;
        uint256 expectedFee = (amount * 50) / 10000; // 0.5%

        uint256 fee = feeController.calculateAMMSwapFee(amount);
        assertEq(fee, expectedFee);
    }

    function test_CalculateAMMSwapFee_ExemptUser() public {
        vm.prank(owner);
        feeController.setFeeExempt(exemptUser, true);

        vm.prank(exemptUser);
        uint256 fee = feeController.calculateAMMSwapFee(1000 ether);
        assertEq(fee, 0);
    }

    // ============ calculateLiquidityFee Tests ============

    function test_CalculateLiquidityFee_NormalUser() public {
        uint256 amount = 1000 ether;
        uint256 expectedFee = (amount * 25) / 10000; // 0.25%

        uint256 fee = feeController.calculateLiquidityFee(amount);
        assertEq(fee, expectedFee);
    }

    // ============ accumulateFeeETH Tests ============

    function test_AccumulateFeeETH_Success() public {
        uint256 feeAmount = 1 ether;
        vm.deal(user, feeAmount);

        vm.prank(user);
        feeController.accumulateFeeETH{value: feeAmount}();

        assertEq(feeController.getAccumulatedETH(), feeAmount);
    }

    function test_AccumulateFeeETH_Event() public {
        uint256 feeAmount = 1 ether;
        vm.deal(user, feeAmount);

        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit PlatformFeeController.FeeAccumulated(address(0), feeAmount, true);
        feeController.accumulateFeeETH{value: feeAmount}();
    }

    function test_AccumulateFeeETH_Multiple() public {
        vm.deal(user, 3 ether);

        vm.prank(user);
        feeController.accumulateFeeETH{value: 1 ether}();

        vm.prank(user);
        feeController.accumulateFeeETH{value: 2 ether}();

        assertEq(feeController.getAccumulatedETH(), 3 ether);
    }

    function test_AccumulateFeeETH_RevertWhen_ZeroAmount() public {
        vm.prank(user);
        vm.expectRevert(PlatformFeeController.NoFeesAccumulated.selector);
        feeController.accumulateFeeETH{value: 0}();
    }

    // ============ accumulateFeeToken Tests ============

    function test_AccumulateFeeToken_Success() public {
        uint256 feeAmount = 100 ether;
        vm.prank(owner);
        token.approve(address(feeController), feeAmount);

        vm.prank(owner);
        feeController.accumulateFeeToken(address(token), feeAmount);

        assertEq(feeController.getAccumulatedToken(address(token)), feeAmount);
    }

    function test_AccumulateFeeToken_RevertWhen_InvalidToken() public {
        vm.prank(owner);
        vm.expectRevert(PlatformFeeController.InvalidToken.selector);
        feeController.accumulateFeeToken(address(0), 100 ether);
    }

    // ============ withdrawETHFees Tests ============

    function test_WithdrawETHFees_Success() public {
        uint256 feeAmount = 1 ether;
        vm.deal(user, feeAmount);

        vm.prank(user);
        feeController.accumulateFeeETH{value: feeAmount}();

        uint256 recipientBalanceBefore = feeRecipient.balance;
        vm.prank(owner);
        feeController.withdrawETHFees();

        assertEq(feeController.getAccumulatedETH(), 0);
        assertEq(feeRecipient.balance, recipientBalanceBefore + feeAmount);
    }

    function test_WithdrawETHFees_RevertWhen_NoFees() public {
        vm.prank(owner);
        vm.expectRevert(PlatformFeeController.NoFeesAccumulated.selector);
        feeController.withdrawETHFees();
    }

    // ============ withdrawTokenFees Tests ============

    function test_WithdrawTokenFees_Success() public {
        uint256 feeAmount = 100 ether;
        vm.prank(owner);
        token.approve(address(feeController), feeAmount);

        vm.prank(owner);
        feeController.accumulateFeeToken(address(token), feeAmount);

        vm.prank(owner);
        feeController.withdrawTokenFees(address(token));

        assertEq(feeController.getAccumulatedToken(address(token)), 0);
        assertEq(token.balanceOf(feeRecipient), feeAmount);
    }

    function test_WithdrawTokenFees_RevertWhen_InvalidToken() public {
        vm.prank(owner);
        vm.expectRevert(PlatformFeeController.InvalidToken.selector);
        feeController.withdrawTokenFees(address(0));
    }
}

