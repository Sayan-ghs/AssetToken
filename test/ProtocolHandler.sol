// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetToken.sol";
import "../src/PrimarySale.sol";
import "../src/AMMPool.sol";
import "../src/AssetRegistry.sol";

/**
 * @title ProtocolHandler
 * @notice Audit-grade handler for invariant testing
 */
contract ProtocolHandler is Test {
    AssetToken public token;
    PrimarySale public primarySale;
    AMMPool public ammPool;
    AssetRegistry public registry;

    address public seller;

    /*//////////////////////////////////////////////////////////////
                          GHOST STATE
    //////////////////////////////////////////////////////////////*/

    uint256 public ghost_protocolETH; // ETH in primary sale
    uint256 public ghost_ammETH; // ETH in AMM

    uint256 public callCount_registerAsset;

    /*//////////////////////////////////////////////////////////////
                              SETUP
    //////////////////////////////////////////////////////////////*/

    constructor(
        AssetToken _token,
        PrimarySale _primarySale,
        AMMPool _ammPool,
        AssetRegistry _registry,
        address _seller
    ) {
        token = _token;
        primarySale = _primarySale;
        ammPool = _ammPool;
        registry = _registry;
        seller = _seller;

        // 🔑 CRITICAL: sync ghost state with real AMM ETH
        ghost_ammETH = address(ammPool).balance;
        ghost_protocolETH = address(primarySale).balance;
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

    function _actor(uint256 seed) internal returns (address actor) {
        actor = address(uint160(uint256(keccak256(abi.encode(seed)))));
        vm.assume(actor != address(0));

        // Ensure actors always have ETH
        if (actor.balance < 100 ether) {
            vm.deal(actor, 1_000 ether);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        HANDLER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function purchaseTokens(uint256 seed, uint256 ethAmount) public {
        address actor = _actor(seed);

        ethAmount = bound(ethAmount, 0.01 ether, 10 ether);
        if (actor.balance < ethAmount) return;

        try primarySale.getSale(address(token)) returns (PrimarySale.Sale memory sale) {
            if (!sale.active || block.timestamp < sale.startTime || block.timestamp >= sale.endTime) return;

            uint256 tokenAmount = ethAmount / sale.pricePerToken;
            if (tokenAmount == 0) return;

            uint256 cost = tokenAmount * sale.pricePerToken;
            if (cost > actor.balance) return;

            vm.prank(actor);
            primarySale.purchaseTokens{value: cost}(address(token), tokenAmount);

            ghost_protocolETH += cost;
        } catch {}
    }

    function swapETHForTokens(uint256 seed, uint256 ethAmount) public {
        address actor = _actor(seed);

        ethAmount = bound(ethAmount, 0.001 ether, 5 ether);
        if (actor.balance < ethAmount) return;

        (uint256 rToken, uint256 rETH) = ammPool.getReserves();
        if (rToken == 0 || rETH == 0) return;

        if (ethAmount > rETH / 2) ethAmount = rETH / 2;
        if (ethAmount == 0) return;

        vm.prank(actor);
        try ammPool.swapETHForTokens{value: ethAmount}(0) {
            ghost_ammETH += ethAmount;
        } catch {}
    }

    function swapTokensForETH(uint256 seed, uint256 tokenAmount) public {
        address actor = _actor(seed);

        uint256 bal = token.balanceOf(actor);
        if (bal == 0) return;

        (uint256 rToken, uint256 rETH) = ammPool.getReserves();
        if (rToken == 0 || rETH == 0) return;

        tokenAmount = bound(tokenAmount, 1, bal);
        if (tokenAmount > (rToken * 9) / 10) {
            tokenAmount = (rToken * 9) / 10;
        }

        uint256 ethBefore = actor.balance;

        vm.startPrank(actor);
        token.approve(address(ammPool), tokenAmount);
        try ammPool.swapTokensForETH(tokenAmount, 0) {
            uint256 ethOut = actor.balance - ethBefore;
            ghost_ammETH -= ethOut;
        } catch {}
        vm.stopPrank();
    }

    function addLiquidity(uint256 seed, uint256 tokenAmount, uint256 ethAmount) public {
        address actor = _actor(seed);

        tokenAmount = bound(tokenAmount, 1 ether, 100 ether);
        ethAmount = bound(ethAmount, 0.1 ether, 10 ether);

        if (actor.balance < ethAmount) return;

        if (token.balanceOf(actor) < tokenAmount) {
            vm.prank(seller);
            if (token.balanceOf(seller) >= tokenAmount) {
                token.transfer(actor, tokenAmount);
            } else {
                return;
            }
        }

        vm.startPrank(actor);
        token.approve(address(ammPool), tokenAmount);

        uint256 ethBefore = actor.balance;
        try ammPool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0) {
            ghost_ammETH += (ethBefore - actor.balance);
        } catch {}
        vm.stopPrank();
    }

    function removeLiquidity(uint256 seed, uint256 pct) public {
        address actor = _actor(seed);

        uint256 lpBal = ammPool.balanceOf(actor);
        if (lpBal == 0) return;

        pct = bound(pct, 1, 100);
        uint256 lpRemove = (lpBal * pct) / 100;
        if (lpRemove == 0) return;

        uint256 ethBefore = actor.balance;

        vm.prank(actor);
        try ammPool.removeLiquidity(lpRemove, 0, 0) {
            ghost_ammETH -= (actor.balance - ethBefore);
        } catch {}
    }

    function registerAsset(uint256 seed, uint256 supply) public {
        if (callCount_registerAsset > 5) return;
        callCount_registerAsset++;

        address actor = _actor(seed);
        supply = bound(supply, 1_000 ether, 1_000_000 ether);

        vm.prank(actor);
        try new AssetToken("Test", "TEST", supply, actor) returns (AssetToken newToken) {
            vm.prank(actor);
            try registry.registerAsset(address(newToken), "ipfs://test") {} catch {}
        } catch {}
    }
}
