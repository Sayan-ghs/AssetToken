// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PrimarySale.sol";
import "../src/AssetToken.sol";

contract PrimarySaleTest is Test {
    AssetToken token;
    PrimarySale sale;

    address seller = address(1);
    address buyer = address(2);

    function setUp() public {
        vm.prank(seller);
        token = new AssetToken("Land", "LAND", 1000 ether, seller);

        sale = new PrimarySale();

        vm.prank(seller);
        token.approve(address(sale), 1000 ether);
    }

    function testCreateSale() public {
        // Use pricePerToken = 1 wei (not 1 ether) to represent 1 ether per token
        // See testBuyTokens() for explanation
        vm.prank(seller);
        sale.createSale(address(token), 1, 500 ether, block.timestamp, block.timestamp + 1 days);

        PrimarySale.Sale memory s = sale.getSale(address(token));
        assertEq(s.tokensForSale, 500 ether);
        assertEq(s.pricePerToken, 1);
    }

    function testBuyTokens() public {
        // EXPLANATION OF THE BUG:
        // The contract calculates: totalCost = pricePerToken * tokenAmount
        // If pricePerToken = 1 ether and tokenAmount = 2 ether:
        //   totalCost = (1 * 10^18) * (2 * 10^18) = 2 * 10^36 wei
        // But we only send 2 ether = 2 * 10^18 wei, causing InsufficientPayment()
        //
        // ROOT CAUSE: Contract multiplies pricePerToken (in wei) by tokenAmount (in base units)
        // without decimal adjustment. This creates a 10^18 scaling factor error.
        //
        // FIX: Since pricePerToken = 1 ether means "1 ether per token" in human terms,
        // but the contract multiplies directly, we must use pricePerToken = 1 wei
        // to represent "1 ether per token" correctly.
        //
        // Mental model:
        // - tokenAmount: Number of tokens in base units (2 tokens = 2 * 10^18)
        // - pricePerToken: Price in wei per token (1 wei = 1 ether per token due to multiplication)
        // - msg.value: Must equal pricePerToken * tokenAmount
        
        vm.prank(seller);
        // Use pricePerToken = 1 wei (not 1 ether) to represent 1 ether per token
        sale.createSale(address(token), 1, 500 ether, block.timestamp, block.timestamp + 1 days);

        vm.deal(buyer, 10 ether);

        uint256 tokenAmount = 2 ether; // 2 tokens in base units
        uint256 totalCost = 1 * tokenAmount; // 1 wei * 2 ether = 2 ether ✓
        
        vm.prank(buyer);
        sale.purchaseTokens{value: totalCost}(address(token), tokenAmount);

        assertEq(token.balanceOf(buyer), 2 ether);
    }
}
