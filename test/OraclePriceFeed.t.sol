// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/OraclePriceFeed.sol";
import "../src/AssetToken.sol";
import "./mocks/MockAggregatorV3.sol";

contract OraclePriceFeedTest is Test {
    OraclePriceFeed oracle;
    AssetToken token;
    MockAggregatorV3 mockFeed;

    address owner = address(1);
    address user = address(2);

    function setUp() public {
        oracle = new OraclePriceFeed();

        vm.prank(owner);
        token = new AssetToken("Test Token", "TEST", 1000 ether, owner);

        // Create mock price feed with 8 decimals and price of $100 (100 * 10^8)
        mockFeed = new MockAggregatorV3(8, 100 * 10**8);
    }

    // ============ setPriceFeed Tests ============

    function test_SetPriceFeed_Success() public {
        oracle.setPriceFeed(address(token), address(mockFeed));

        assertEq(oracle.tokenPriceFeed(address(token)), address(mockFeed));
    }

    function test_SetPriceFeed_Event() public {
        vm.expectEmit(true, true, false, false);
        emit OraclePriceFeed.PriceFeedSet(address(token), address(mockFeed));
        oracle.setPriceFeed(address(token), address(mockFeed));
        
        // Verify it was actually set
        assertEq(oracle.tokenPriceFeed(address(token)), address(mockFeed));
    }

    function test_SetPriceFeed_RevertWhen_InvalidPriceFeed() public {
        vm.expectRevert(OraclePriceFeed.InvalidPriceFeed.selector);
        oracle.setPriceFeed(address(token), address(0));
    }

    function test_SetPriceFeed_RevertWhen_FeedNotCallable() public {
        // Create a contract that doesn't implement the interface
        address invalidFeed = address(new AssetToken("Invalid", "INV", 100 ether, owner));
        vm.expectRevert(OraclePriceFeed.InvalidPriceFeed.selector);
        oracle.setPriceFeed(address(token), invalidFeed);
    }

    // ============ getPrice Tests ============

    function test_GetPrice_Success() public {
        oracle.setPriceFeed(address(token), address(mockFeed));

        (int256 price, uint8 decimals) = oracle.getPrice(address(token));

        assertEq(price, 100 * 10**8);
        assertEq(decimals, 8);
    }

    function test_GetPrice_RevertWhen_PriceFeedNotFound() public {
        vm.expectRevert(OraclePriceFeed.PriceFeedNotFound.selector);
        oracle.getPrice(address(token));
    }

    function test_GetPrice_RevertWhen_InvalidPrice() public {
        oracle.setPriceFeed(address(token), address(mockFeed));
        mockFeed.setInvalid();

        vm.expectRevert(OraclePriceFeed.InvalidPrice.selector);
        oracle.getPrice(address(token));
    }

    function test_GetPrice_RevertWhen_StalePrice() public {
        oracle.setPriceFeed(address(token), address(mockFeed));
        mockFeed.setStale();

        vm.expectRevert(OraclePriceFeed.StalePrice.selector);
        oracle.getPrice(address(token));
    }

    function test_GetPrice_RevertWhen_ZeroUpdatedAt() public {
        oracle.setPriceFeed(address(token), address(mockFeed));
        mockFeed.setZeroUpdatedAt();

        vm.expectRevert(OraclePriceFeed.StalePrice.selector);
        oracle.getPrice(address(token));
    }

    // ============ getLatestRoundData Tests ============

    function test_GetLatestRoundData_Success() public {
        oracle.setPriceFeed(address(token), address(mockFeed));

        (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) =
            oracle.getLatestRoundData(address(token));

        assertEq(price, 100 * 10**8);
        assertGt(updatedAt, 0);
    }

    function test_GetLatestRoundData_RevertWhen_PriceFeedNotFound() public {
        vm.expectRevert(OraclePriceFeed.PriceFeedNotFound.selector);
        oracle.getLatestRoundData(address(token));
    }

    // ============ Edge Cases ============

    function test_UpdatePrice() public {
        oracle.setPriceFeed(address(token), address(mockFeed));

        // Update price
        mockFeed.setPrice(200 * 10**8);

        (int256 newPrice,) = oracle.getPrice(address(token));
        assertEq(newPrice, 200 * 10**8);
    }

    function test_MultipleTokens() public {
        AssetToken token2 = new AssetToken("Token 2", "TKN2", 1000 ether, owner);
        MockAggregatorV3 feed2 = new MockAggregatorV3(18, 50 * 10**18);

        oracle.setPriceFeed(address(token), address(mockFeed));
        oracle.setPriceFeed(address(token2), address(feed2));

        (int256 price1,) = oracle.getPrice(address(token));
        (int256 price2,) = oracle.getPrice(address(token2));

        assertEq(price1, 100 * 10**8);
        assertEq(price2, 50 * 10**18);
    }
}

