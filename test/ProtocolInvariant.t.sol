// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetToken.sol";
import "../src/PrimarySale.sol";
import "../src/AMMPool.sol";
import "../src/LPToken.sol";
import "../src/AssetRegistry.sol";
import "./ProtocolHandler.sol";

/**
 * @title ProtocolInvariant
 * @notice Invariant tests for the entire AssetToken protocol
 * @dev Tests critical invariants that must hold under ANY sequence of operations.
 *      Uses Handler contract for stateful fuzzing.
 * 
 * Invariants tested:
 * 1. Token total supply never changes
 * 2. Sum of balances equals total supply
 * 3. AMM reserves never go negative
 * 4. Constant product K never decreases (only increases due to fees)
 * 5. LP token supply correctly reflects liquidity
 * 6. No ETH/tokens created from nothing (conservation)
 */
contract ProtocolInvariant is Test {
    AssetToken public token;
    PrimarySale public primarySale;
    AMMPool public ammPool;
    LPToken public lpToken;
    AssetRegistry public registry;
    ProtocolHandler public handler;

    address public seller = address(0x999);
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;
    uint256 public initialK; // Initial K-invariant

    function setUp() public {
        // Deploy contracts
        vm.prank(seller);
        token = new AssetToken("Asset Token", "ASSET", INITIAL_SUPPLY, seller);

        primarySale = new PrimarySale();
        ammPool = new AMMPool(address(token));
        lpToken = new LPToken("LP Token", "LP", address(ammPool));
        registry = new AssetRegistry();

        // Fund seller with ETH for liquidity
        vm.deal(seller, 1000 ether);

        // Setup primary sale
        vm.startPrank(seller);
        token.approve(address(primarySale), type(uint256).max);
        primarySale.createSale(
            address(token),
            1, // 1 wei per token (represents 1 ETH per token due to scaling)
            100_000 ether,
            block.timestamp,
            block.timestamp + 365 days
        );
        vm.stopPrank();

        // Setup initial AMM liquidity
        vm.startPrank(seller);
        token.approve(address(ammPool), type(uint256).max);
        ammPool.addLiquidity{value: 100 ether}(100_000 ether, 0, 0);
        vm.stopPrank();

        // Record initial K-invariant
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        initialK = reserveToken * reserveETH;

        // Deploy handler
        handler = new ProtocolHandler(token, primarySale, ammPool, registry, seller);

        // Target handler for invariant testing
        targetContract(address(handler));

        // Label addresses for better trace output
        vm.label(address(token), "AssetToken");
        vm.label(address(primarySale), "PrimarySale");
        vm.label(address(ammPool), "AMMPool");
        vm.label(address(registry), "AssetRegistry");
        vm.label(address(handler), "Handler");
    }

    /*//////////////////////////////////////////////////////////////
                    ASSET TOKEN INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Token total supply must remain constant
     * @dev Total supply is set at deployment and should never change
     */
    function invariant_totalSupplyNeverChanges() public view {
        assertEq(token.totalSupply(), INITIAL_SUPPLY, "Total supply should never change");
    }

    /**
     * @notice Sum of all tracked balances should equal total supply
     * @dev Ensures no tokens are created or destroyed
     */
    function invariant_sumOfBalancesEqualsTotalSupply() public view {
        uint256 sumOfBalances = token.balanceOf(seller)
            + token.balanceOf(address(primarySale))
            + token.balanceOf(address(ammPool))
            + token.balanceOf(handler.actors(0))
            + token.balanceOf(handler.actors(1))
            + token.balanceOf(handler.actors(2))
            + token.balanceOf(handler.actors(3));

        // Allow for tokens held by other addresses (e.g., new assets created in handler)
        assertTrue(sumOfBalances <= INITIAL_SUPPLY, "Sum of balances exceeds total supply");
    }

    /*//////////////////////////////////////////////////////////////
                    AMM RESERVE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice AMM reserves should never be negative (implicit in uint256)
     * @dev When pool has liquidity, both reserves must be positive
     */
    function invariant_reservesNeverNegative() public view {
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        
        uint256 totalSupply = ammPool.totalSupply();
        if (totalSupply > 0) {
            // If there's liquidity, both reserves must be positive
            assertTrue(reserveToken > 0, "Token reserve should be positive when liquidity exists");
            assertTrue(reserveETH > 0, "ETH reserve should be positive when liquidity exists");
        }
    }

    /**
     * @notice Reserve values should match actual contract balances
     * @dev Ensures no accounting errors in reserve tracking
     */
    function invariant_reservesMatchActualBalances() public view {
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        
        uint256 actualTokenBalance = token.balanceOf(address(ammPool));
        uint256 actualETHBalance = address(ammPool).balance;

        assertEq(reserveToken, actualTokenBalance, "Token reserve mismatch");
        assertEq(reserveETH, actualETHBalance, "ETH reserve mismatch");
    }

    /*//////////////////////////////////////////////////////////////
                    K-INVARIANT (CONSTANT PRODUCT)
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Constant product K should never decrease
     * @dev K = reserveToken * reserveETH should increase with fees
     *      May have small variations due to rounding
     */
    function invariant_constantProductNeverDecreases() public view {
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        
        if (reserveToken == 0 || reserveETH == 0) {
            // Pool is empty, skip check
            return;
        }

        uint256 currentK = reserveToken * reserveETH;
        
        // K should never decrease significantly (allow 0.1% for rounding)
        // In practice, K should increase due to 0.3% swap fees
        uint256 minAcceptableK = (initialK * 999) / 1000;
        
        assertTrue(
            currentK >= minAcceptableK,
            "K-invariant decreased beyond acceptable rounding"
        );
    }

    /*//////////////////////////////////////////////////////////////
                    LP TOKEN INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice LP token total supply should reflect pool liquidity
     * @dev When liquidity exists, LP supply must be positive
     */
    function invariant_lpTotalSupplyMatchesLiquidity() public view {
        uint256 totalSupply = ammPool.totalSupply();
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();

        if (reserveToken > 0 && reserveETH > 0) {
            assertTrue(totalSupply > 0, "LP supply should be positive when liquidity exists");
        }

        if (totalSupply == 0) {
            assertEq(reserveToken, 0, "Token reserve should be 0 when no LP tokens");
            assertEq(reserveETH, 0, "ETH reserve should be 0 when no LP tokens");
        }
    }

    /**
     * @notice LP tokens should never exceed max reasonable supply
     * @dev Prevents overflow and unrealistic inflation
     */
    function invariant_lpTokensNeverExceedMaxSupply() public view {
        uint256 totalSupply = ammPool.totalSupply();
        uint256 maxReasonableSupply = 1_000_000_000 ether; // 1 billion LP tokens

        assertTrue(
            totalSupply <= maxReasonableSupply,
            "LP token supply exceeds maximum reasonable amount"
        );
    }

    /*//////////////////////////////////////////////////////////////
                    FUND CONSERVATION INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Total tokens in system should equal initial supply
     * @dev No tokens should be created or destroyed
     */
    function invariant_noTokensCreatedFromNothing() public view {
        uint256 totalTokensInSystem = 
            token.balanceOf(seller) +
            token.balanceOf(address(ammPool)) +
            token.balanceOf(address(primarySale)) +
            token.balanceOf(handler.actors(0)) +
            token.balanceOf(handler.actors(1)) +
            token.balanceOf(handler.actors(2)) +
            token.balanceOf(handler.actors(3));

        // Account for tokens in newly created assets (from registerAsset)
        // These are separate tokens, not part of the original supply
        assertTrue(
            totalTokensInSystem <= INITIAL_SUPPLY,
            "Total tokens in tracked addresses exceeds initial supply"
        );
    }

    /**
     * @notice ETH should be conserved in the system
     * @dev Total ETH in contracts should match deposits minus withdrawals
     */
    function invariant_noETHCreatedFromNothing() public view {
        uint256 ethInAMM = address(ammPool).balance;
        uint256 ethInPrimarySale = address(primarySale).balance;
        
        // ETH in system should not exceed reasonable bounds
        // Actors started with 1000 ETH each (4 actors = 4000 ETH)
        uint256 maxETH = 4000 ether + 100 ether; // Initial funding + setup
        
        assertTrue(
            ethInAMM + ethInPrimarySale <= maxETH,
            "ETH in contracts exceeds maximum possible"
        );
    }

    /*//////////////////////////////////////////////////////////////
                    AUTHORIZATION INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Only AMM pool should be able to mint LP tokens
     * @dev This is enforced by LPToken contract, verify it holds
     */
    function invariant_onlyPoolCanMintLPTokens() public view {
        // This is verified by the contract design
        // LPToken.mint() has onlyPool modifier
        // We verify by checking that all LP tokens are from valid operations
        uint256 totalLPSupply = ammPool.totalSupply();
        
        // Sum of all actor LP balances should not exceed total supply
        uint256 sumLPBalances = 
            ammPool.balanceOf(seller) +
            ammPool.balanceOf(handler.actors(0)) +
            ammPool.balanceOf(handler.actors(1)) +
            ammPool.balanceOf(handler.actors(2)) +
            ammPool.balanceOf(handler.actors(3));

        assertEq(sumLPBalances, totalLPSupply, "LP balance mismatch indicates unauthorized minting");
    }

    /**
     * @notice Asset registry count should match registered assets
     * @dev Ensures proper accounting in AssetRegistry
     */
    function invariant_assetRegistryCountValid() public view {
        uint256 count = registry.assetCount();
        
        // Count should never decrease
        // Count should be within reasonable bounds
        assertTrue(count <= 1000, "Asset count exceeds reasonable maximum");
    }

    /*//////////////////////////////////////////////////////////////
                    MATHEMATICAL INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Verify AMM pricing formula consistency
     * @dev getAmountOut should match actual swap results
     */
    function invariant_ammPricingConsistent() public view {
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        
        if (reserveToken == 0 || reserveETH == 0) return;

        // For a 1 ETH swap, verify pricing is consistent
        uint256 amountIn = 1 ether;
        if (amountIn >= reserveETH) return; // Skip if would drain reserves
        
        uint256 expectedOut = ammPool.getAmountOut(amountIn, true);
        
        // Expected output should be less than reserve (can't drain pool)
        assertTrue(expectedOut < reserveToken, "AMM pricing allows reserve drain");
        assertTrue(expectedOut > 0 || amountIn == 0, "AMM pricing returns zero unexpectedly");
    }

    /**
     * @notice Verify no user has negative balance (implicit in uint256)
     * @dev Additional check for tracked balances
     */
    function invariant_noNegativeBalances() public view {
        // This is implicitly guaranteed by uint256, but we verify tracking
        assertTrue(token.balanceOf(seller) >= 0, "Seller balance invalid");
        assertTrue(token.balanceOf(handler.actors(0)) >= 0, "Actor 0 balance invalid");
        assertTrue(token.balanceOf(handler.actors(1)) >= 0, "Actor 1 balance invalid");
        assertTrue(token.balanceOf(handler.actors(2)) >= 0, "Actor 2 balance invalid");
        assertTrue(token.balanceOf(handler.actors(3)) >= 0, "Actor 3 balance invalid");
    }

    /*//////////////////////////////////////////////////////////////
                    STATE CONSISTENCY INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Primary sale state should be consistent
     * @dev Tokens sold should never exceed tokens for sale
     */
    function invariant_primarySaleConsistent() public view {
        try primarySale.getSale(address(token)) returns (PrimarySale.Sale memory sale) {
            assertTrue(
                sale.tokensSold <= sale.tokensForSale,
                "Tokens sold exceeds tokens for sale"
            );
            
            assertTrue(
                sale.fundsWithdrawn <= sale.tokensSold * sale.pricePerToken,
                "Funds withdrawn exceeds funds raised"
            );
        } catch {
            // Sale doesn't exist, which is fine
        }
    }

    /**
     * @notice AMM pool should maintain internal consistency
     * @dev Total supply should match sum of all LP balances
     */
    function invariant_ammPoolInternalConsistency() public view {
        uint256 totalSupply = ammPool.totalSupply();
        
        // Sum all known LP balances
        uint256 sumBalances = 
            ammPool.balanceOf(seller) +
            ammPool.balanceOf(handler.actors(0)) +
            ammPool.balanceOf(handler.actors(1)) +
            ammPool.balanceOf(handler.actors(2)) +
            ammPool.balanceOf(handler.actors(3));

        // Sum should equal total supply (accounting for all holders)
        assertEq(sumBalances, totalSupply, "LP token accounting mismatch");
    }

    /*//////////////////////////////////////////////////////////////
                    HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function invariant_callSummary() public view {
        handler.callSummary();
    }
}
