// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ProofOfReserve.sol";
import "../src/AssetToken.sol";
import "./mocks/MockAggregatorV3.sol";

contract ProofOfReserveTest is Test {
    ProofOfReserve proofOfReserve;
    AssetToken token;
    MockAggregatorV3 mockFeed;

    address owner = address(1);
    uint256 constant TOTAL_SUPPLY = 10000 ether;

    function setUp() public {
        proofOfReserve = new ProofOfReserve();

        vm.prank(owner);
        token = new AssetToken("Test Token", "TEST", TOTAL_SUPPLY, owner);

        // Create mock reserve feed with reserve matching total supply (within 5% deviation)
        mockFeed = new MockAggregatorV3(18, int256(TOTAL_SUPPLY));
    }

    // ============ setReserveFeed Tests ============

    function test_SetReserveFeed_Success() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));

        assertEq(proofOfReserve.tokenReserveFeed(address(token)), address(mockFeed));
    }

    function test_SetReserveFeed_Event() public {
        vm.expectEmit(true, true, false, false);
        emit ProofOfReserve.ReserveFeedSet(address(token), address(mockFeed));
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
    }

    function test_SetReserveFeed_RevertWhen_InvalidReserveFeed() public {
        vm.expectRevert(ProofOfReserve.InvalidReserveFeed.selector);
        proofOfReserve.setReserveFeed(address(token), address(0));
    }

    // ============ setTotalSupply Tests ============

    function test_SetTotalSupply_Success() public {
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);

        assertEq(proofOfReserve.tokenTotalSupply(address(token)), TOTAL_SUPPLY);
    }

    function test_SetTotalSupply_Event() public {
        vm.expectEmit(true, true, false, true);
        emit ProofOfReserve.TotalSupplySet(address(token), TOTAL_SUPPLY);
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);
    }

    function test_SetTotalSupply_RevertWhen_InvalidTotalSupply() public {
        vm.expectRevert(ProofOfReserve.InvalidTotalSupply.selector);
        proofOfReserve.setTotalSupply(address(token), 0);
    }

    // ============ getReserve Tests ============

    function test_GetReserve_Success() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));

        (int256 reserve, uint8 decimals) = proofOfReserve.getReserve(address(token));

        assertEq(reserve, int256(TOTAL_SUPPLY));
        assertEq(decimals, 18);
    }

    function test_GetReserve_RevertWhen_ReserveFeedNotFound() public {
        vm.expectRevert(ProofOfReserve.ReserveFeedNotFound.selector);
        proofOfReserve.getReserve(address(token));
    }

    function test_GetReserve_RevertWhen_InvalidReserve() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        mockFeed.setInvalid();

        vm.expectRevert(ProofOfReserve.InvalidReserve.selector);
        proofOfReserve.getReserve(address(token));
    }

    function test_GetReserve_RevertWhen_StaleReserve() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        mockFeed.setStale();

        vm.expectRevert(ProofOfReserve.StaleReserve.selector);
        proofOfReserve.getReserve(address(token));
    }

    // ============ checkReserve Tests ============

    function test_CheckReserve_Valid() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);

        (uint256 reserveAmount, uint256 totalSupply, bool isValid) = proofOfReserve.checkReserve(address(token));

        assertEq(reserveAmount, TOTAL_SUPPLY);
        assertEq(totalSupply, TOTAL_SUPPLY);
        assertTrue(isValid);
    }

    function test_CheckReserve_WithinDeviation() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);

        // Set reserve to 4% above total supply (within 5% limit)
        uint256 reserveAmount = TOTAL_SUPPLY + (TOTAL_SUPPLY * 4 / 100);
        mockFeed.setPrice(int256(reserveAmount));

        (uint256 reserve, uint256 totalSupply, bool isValid) = proofOfReserve.checkReserve(address(token));

        assertTrue(isValid);
        assertEq(reserve, reserveAmount);
    }

    function test_CheckReserve_ExceedsDeviation() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);

        // Set reserve to 6% above total supply (exceeds 5% limit)
        uint256 reserveAmount = TOTAL_SUPPLY + (TOTAL_SUPPLY * 6 / 100);
        mockFeed.setPrice(int256(reserveAmount));

        (uint256 reserve, uint256 totalSupply, bool isValid) = proofOfReserve.checkReserve(address(token));

        assertFalse(isValid);
        assertEq(reserve, reserveAmount);
    }

    function test_CheckReserve_BelowTotalSupply() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);

        // Set reserve to 4% below total supply (within 5% limit)
        uint256 reserveAmount = TOTAL_SUPPLY - (TOTAL_SUPPLY * 4 / 100);
        mockFeed.setPrice(int256(reserveAmount));

        (uint256 reserve, uint256 totalSupply, bool isValid) = proofOfReserve.checkReserve(address(token));

        assertTrue(isValid);
        assertEq(reserve, reserveAmount);
    }

    function test_CheckReserve_RevertWhen_ReserveFeedNotFound() public {
        vm.expectRevert(ProofOfReserve.ReserveFeedNotFound.selector);
        proofOfReserve.checkReserve(address(token));
    }

    function test_CheckReserve_RevertWhen_InvalidTotalSupply() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        // Don't set total supply

        vm.expectRevert(ProofOfReserve.InvalidTotalSupply.selector);
        proofOfReserve.checkReserve(address(token));
    }

    // ============ verifyReserve Tests ============

    function test_VerifyReserve_Valid() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);

        vm.expectEmit(true, false, false, true);
        emit ProofOfReserve.ReserveVerified(address(token), TOTAL_SUPPLY, TOTAL_SUPPLY, true);

        bool isValid = proofOfReserve.verifyReserve(address(token));
        assertTrue(isValid);
    }

    function test_VerifyReserve_Invalid() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));
        proofOfReserve.setTotalSupply(address(token), TOTAL_SUPPLY);

        // Set reserve to 6% above (exceeds deviation)
        uint256 reserveAmount = TOTAL_SUPPLY + (TOTAL_SUPPLY * 6 / 100);
        mockFeed.setPrice(int256(reserveAmount));

        vm.expectEmit(true, false, false, true);
        emit ProofOfReserve.ReserveVerified(address(token), reserveAmount, TOTAL_SUPPLY, false);

        bool isValid = proofOfReserve.verifyReserve(address(token));
        assertFalse(isValid);
    }

    // ============ getLatestReserveData Tests ============

    function test_GetLatestReserveData_Success() public {
        proofOfReserve.setReserveFeed(address(token), address(mockFeed));

        (uint80 roundId, int256 reserve, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) =
            proofOfReserve.getLatestReserveData(address(token));

        assertEq(reserve, int256(TOTAL_SUPPLY));
        assertGt(updatedAt, 0);
    }

    function test_GetLatestReserveData_RevertWhen_ReserveFeedNotFound() public {
        vm.expectRevert(ProofOfReserve.ReserveFeedNotFound.selector);
        proofOfReserve.getLatestReserveData(address(token));
    }
}

