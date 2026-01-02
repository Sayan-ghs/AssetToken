// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetToken.sol";
import "../src/PrimarySale.sol";
import "../src/AMMPool.sol";
import "../src/LPToken.sol";
import "../src/AssetRegistry.sol";

/**
 * @title ProtocolHandler
 * @notice Handler contract for invariant testing
 * @dev Randomly calls protocol functions with bounded inputs.
 *      Used by Foundry's invariant testing framework to explore state space.
 */
contract ProtocolHandler is Test {
    AssetToken public token;
    PrimarySale public primarySale;
    AMMPool public ammPool;
    AssetRegistry public registry;

    address public seller;
    address[] public actors;

    // Ghost variables for tracking state
    uint256 public ghost_totalETHDeposited;
    uint256 public ghost_totalETHWithdrawn;
    uint256 public ghost_zeroBalanceCount;
    mapping(address => uint256) public ghost_balances;

    // Call counters for debugging
    uint256 public callCount_purchaseTokens;
    uint256 public callCount_swapETHForTokens;
    uint256 public callCount_swapTokensForETH;
    uint256 public callCount_addLiquidity;
    uint256 public callCount_removeLiquidity;
    uint256 public callCount_registerAsset;

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

        // Create actors
        actors.push(address(0x1001));
        actors.push(address(0x1002));
        actors.push(address(0x1003));
        actors.push(address(0x1004));

        // Fund actors
        for (uint256 i = 0; i < actors.length; i++) {
            vm.deal(actors[i], 1000 ether);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        HANDLER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Purchase tokens from primary sale
     * @dev Bounds: actor index, ETH amount
     */
    function purchaseTokens(uint256 actorSeed, uint256 ethAmount) public {
        // Bound inputs
        uint256 actorIndex = actorSeed % actors.length;
        address actor = actors[actorIndex];

        // Bound ETH amount to reasonable values (0.01 to 10 ETH)
        ethAmount = bound(ethAmount, 0.01 ether, 10 ether);

        // Check if actor has enough balance
        if (actor.balance < ethAmount) {
            return;
        }

        // Attempt purchase (may revert if sale doesn't exist or is inactive)
        try primarySale.getSale(address(token)) returns (PrimarySale.Sale memory sale) {
            if (!sale.active) return;
            if (block.timestamp < sale.startTime || block.timestamp >= sale.endTime) return;

            uint256 maxTokens = sale.tokensForSale - sale.tokensSold;
            if (maxTokens == 0) return;

            uint256 tokenAmount = ethAmount / sale.pricePerToken;
            if (tokenAmount == 0 || tokenAmount > maxTokens) return;

            uint256 totalCost = sale.pricePerToken * tokenAmount;
            if (totalCost > actor.balance) return;

            vm.prank(actor);
            primarySale.purchaseTokens{value: totalCost}(address(token), tokenAmount);

            callCount_purchaseTokens++;
            ghost_totalETHDeposited += totalCost;
            ghost_balances[actor] = token.balanceOf(actor);
        } catch {
            // Sale doesn't exist or other error, skip
        }
    }

    /**
     * @notice Swap ETH for tokens in AMM
     * @dev Bounds: actor index, ETH amount
     */
    function swapETHForTokens(uint256 actorSeed, uint256 ethAmount) public {
        uint256 actorIndex = actorSeed % actors.length;
        address actor = actors[actorIndex];

        ethAmount = bound(ethAmount, 0.01 ether, 5 ether);

        if (actor.balance < ethAmount) return;

        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        if (reserveToken == 0 || reserveETH == 0) return;

        vm.prank(actor);
        try ammPool.swapETHForTokens{value: ethAmount}(0) {
            callCount_swapETHForTokens++;
            ghost_totalETHDeposited += ethAmount;
            ghost_balances[actor] = token.balanceOf(actor);
        } catch {
            // Swap failed, skip
        }
    }

    /**
     * @notice Swap tokens for ETH in AMM
     * @dev Bounds: actor index, token amount
     */
    function swapTokensForETH(uint256 actorSeed, uint256 tokenAmount) public {
        uint256 actorIndex = actorSeed % actors.length;
        address actor = actors[actorIndex];

        uint256 actorBalance = token.balanceOf(actor);
        if (actorBalance == 0) return;

        tokenAmount = bound(tokenAmount, 0.01 ether, actorBalance);

        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        if (reserveToken == 0 || reserveETH == 0) return;

        vm.startPrank(actor);
        token.approve(address(ammPool), tokenAmount);

        try ammPool.swapTokensForETH(tokenAmount, 0) {
            callCount_swapTokensForETH++;
            uint256 ethReceived = actor.balance;
            ghost_totalETHWithdrawn += ethReceived;
            ghost_balances[actor] = token.balanceOf(actor);
        } catch {
            // Swap failed, skip
        }
        vm.stopPrank();
    }

    /**
     * @notice Add liquidity to AMM
     * @dev Bounds: actor index, token amount, ETH amount
     */
    function addLiquidity(uint256 actorSeed, uint256 tokenAmount, uint256 ethAmount) public {
        uint256 actorIndex = actorSeed % actors.length;
        address actor = actors[actorIndex];

        tokenAmount = bound(tokenAmount, 1 ether, 100 ether);
        ethAmount = bound(ethAmount, 0.1 ether, 10 ether);

        if (actor.balance < ethAmount) return;

        uint256 actorTokenBalance = token.balanceOf(actor);
        if (actorTokenBalance < tokenAmount) {
            // Transfer tokens from seller to actor
            vm.prank(seller);
            if (token.balanceOf(seller) >= tokenAmount) {
                token.transfer(actor, tokenAmount);
            } else {
                return;
            }
        }

        vm.startPrank(actor);
        token.approve(address(ammPool), tokenAmount);

        try ammPool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0) {
            callCount_addLiquidity++;
            ghost_totalETHDeposited += ethAmount;
            ghost_balances[actor] = token.balanceOf(actor);
        } catch {
            // Add liquidity failed, skip
        }
        vm.stopPrank();
    }

    /**
     * @notice Remove liquidity from AMM
     * @dev Bounds: actor index, liquidity percentage
     */
    function removeLiquidity(uint256 actorSeed, uint256 liquidityPercent) public {
        uint256 actorIndex = actorSeed % actors.length;
        address actor = actors[actorIndex];

        uint256 lpBalance = ammPool.balanceOf(actor);
        if (lpBalance == 0) return;

        liquidityPercent = bound(liquidityPercent, 1, 100);
        uint256 liquidityToRemove = (lpBalance * liquidityPercent) / 100;
        if (liquidityToRemove == 0) return;

        vm.prank(actor);
        try ammPool.removeLiquidity(liquidityToRemove, 0, 0) {
            callCount_removeLiquidity++;
            ghost_balances[actor] = token.balanceOf(actor);
        } catch {
            // Remove liquidity failed, skip
        }
    }

    /**
     * @notice Register a new asset in registry
     * @dev Creates new token and registers it
     */
    function registerAsset(uint256 actorSeed, uint256 supply) public {
        uint256 actorIndex = actorSeed % actors.length;
        address actor = actors[actorIndex];

        supply = bound(supply, 1000 ether, 1_000_000 ether);

        vm.prank(actor);
        try new AssetToken("Test Asset", "TEST", supply, actor) returns (AssetToken newToken) {
            vm.prank(actor);
            try registry.registerAsset(address(newToken), "ipfs://test") {
                callCount_registerAsset++;
            } catch {
                // Registration failed
            }
        } catch {
            // Token creation failed
        }
    }

    /*//////////////////////////////////////////////////////////////
                        HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function forEachActor(function(address) external func) public {
        for (uint256 i = 0; i < actors.length; i++) {
            func(actors[i]);
        }
    }

    function reduceActors(uint256 acc, function(uint256, address) external returns (uint256) func)
        public
        returns (uint256)
    {
        for (uint256 i = 0; i < actors.length; i++) {
            acc = func(acc, actors[i]);
        }
        return acc;
    }

    function callSummary() external view {
        console.log("\n=== Handler Call Summary ===");
        console.log("Purchase Tokens:", callCount_purchaseTokens);
        console.log("Swap ETH for Tokens:", callCount_swapETHForTokens);
        console.log("Swap Tokens for ETH:", callCount_swapTokensForETH);
        console.log("Add Liquidity:", callCount_addLiquidity);
        console.log("Remove Liquidity:", callCount_removeLiquidity);
        console.log("Register Asset:", callCount_registerAsset);
        console.log("Total ETH Deposited:", ghost_totalETHDeposited);
        console.log("Total ETH Withdrawn:", ghost_totalETHWithdrawn);
    }
}
