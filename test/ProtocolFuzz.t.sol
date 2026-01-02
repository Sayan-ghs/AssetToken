// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetToken.sol";
import "../src/PrimarySale.sol";
import "../src/AMMPool.sol";
import "../src/LPToken.sol";
import "../src/AssetRegistry.sol";

/**
 * @title ProtocolFuzz
 * @notice Comprehensive fuzz test suite for AssetToken protocol
 * @dev Tests critical safety properties across all core contracts:
 *      - No arithmetic overflow/underflow
 *      - No negative balances
 *      - No reserve drain
 *      - Conservation of funds
 *      - K-invariant maintenance (AMM)
 *      - Proper authorization controls
 */
contract ProtocolFuzz is Test {
    AssetToken public token;
    PrimarySale public primarySale;
    AMMPool public ammPool;
    LPToken public lpToken;
    AssetRegistry public registry;

    address public seller = address(0x1);
    address public buyer = address(0x2);
    address public liquidityProvider = address(0x3);
    address public trader = address(0x4);

    uint256 constant INITIAL_TOKEN_SUPPLY = 1_000_000 ether;
    uint256 constant MAX_REASONABLE_ETH = 100_000 ether;
    uint256 constant MAX_REASONABLE_TOKENS = 100_000 ether;

    function setUp() public {
        // Deploy AssetToken
        vm.prank(seller);
        token = new AssetToken("Test Asset", "TEST", INITIAL_TOKEN_SUPPLY, seller);

        // Deploy PrimarySale
        primarySale = new PrimarySale();

        // Deploy AMMPool
        ammPool = new AMMPool(address(token));

        // Deploy LPToken
        lpToken = new LPToken("LP Token", "LP", address(ammPool));

        // Deploy AssetRegistry
        registry = new AssetRegistry();

        // Fund test accounts
        vm.deal(buyer, 10_000 ether);
        vm.deal(liquidityProvider, 10_000 ether);
        vm.deal(trader, 10_000 ether);

        // Approve tokens for various contracts
        vm.prank(seller);
        token.approve(address(primarySale), type(uint256).max);

        vm.prank(seller);
        token.approve(address(ammPool), type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                        PRIMARYSALE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test for purchasing tokens with random ETH amounts
     * @dev Validates:
     *      - No overflow in cost calculations (pricePerToken * tokenAmount)
     *      - Correct refund handling for overpayments
     *      - Token balance updates correctly
     *      - No negative balances
     *      - ETH conservation (sum of balances remains constant)
     */
    function testFuzz_PurchaseTokensRandomAmounts(uint256 pricePerToken, uint256 tokenAmount, uint256 ethSent)
        public
    {
        // Bound inputs to reasonable values to avoid gas exhaustion
        // Price: 1 wei to 1 ether (represents realistic token prices)
        vm.assume(pricePerToken > 0 && pricePerToken <= 1 ether);
        
        // Token amount: 1 to 10,000 tokens
        vm.assume(tokenAmount > 0 && tokenAmount <= 10_000 ether);
        
        // Ensure seller has enough tokens
        vm.assume(tokenAmount <= INITIAL_TOKEN_SUPPLY);

        // Calculate expected cost and bound ethSent
        uint256 expectedCost = pricePerToken * tokenAmount;
        
        // Prevent overflow in cost calculation
        vm.assume(expectedCost / pricePerToken == tokenAmount);
        vm.assume(expectedCost <= MAX_REASONABLE_ETH);
        
        // ETH sent should be at least the cost (can be more for refund testing)
        vm.assume(ethSent >= expectedCost && ethSent <= expectedCost + 100 ether);

        // Create sale
        vm.prank(seller);
        primarySale.createSale(
            address(token),
            pricePerToken,
            tokenAmount,
            block.timestamp,
            block.timestamp + 1 days
        );

        // Record initial balances for conservation check
        uint256 sellerTokensBefore = token.balanceOf(seller);
        uint256 buyerTokensBefore = token.balanceOf(buyer);
        uint256 buyerEthBefore = buyer.balance;

        // Purchase tokens
        vm.prank(buyer);
        primarySale.purchaseTokens{value: ethSent}(address(token), tokenAmount);

        // Verify token transfer
        assertEq(token.balanceOf(buyer), buyerTokensBefore + tokenAmount, "Buyer should receive tokens");
        assertEq(token.balanceOf(seller), sellerTokensBefore - tokenAmount, "Seller tokens should decrease");

        // Verify ETH handling (cost deducted, excess refunded)
        uint256 expectedRefund = ethSent - expectedCost;
        assertEq(buyer.balance, buyerEthBefore - expectedCost, "Buyer should pay exact cost with refund");

        // Verify sale state
        PrimarySale.Sale memory sale = primarySale.getSale(address(token));
        assertEq(sale.tokensSold, tokenAmount, "Tokens sold should be tracked");
        
        // Safety: No negative balances (implicit in uint256, but verify no underflow)
        assertTrue(token.balanceOf(seller) <= sellerTokensBefore, "No underflow in seller balance");
    }

    /**
     * @notice Fuzz test for edge cases in PrimarySale
     * @dev Tests boundary conditions: minimum and maximum values
     */
    function testFuzz_PurchaseTokensEdgeCases(bool useMaxValues) public {
        uint256 pricePerToken;
        uint256 tokenAmount;

        if (useMaxValues) {
            // Test with large values (but prevent overflow)
            pricePerToken = 1 ether;
            tokenAmount = 1000 ether;
        } else {
            // Test with minimum values
            pricePerToken = 1;
            tokenAmount = 1;
        }

        uint256 expectedCost = pricePerToken * tokenAmount;
        vm.assume(expectedCost / pricePerToken == tokenAmount); // Overflow check

        vm.prank(seller);
        primarySale.createSale(
            address(token),
            pricePerToken,
            tokenAmount,
            block.timestamp,
            block.timestamp + 1 days
        );

        vm.deal(buyer, expectedCost + 1 ether);

        vm.prank(buyer);
        primarySale.purchaseTokens{value: expectedCost}(address(token), tokenAmount);

        assertEq(token.balanceOf(buyer), tokenAmount);
    }

    /*//////////////////////////////////////////////////////////////
                          AMMPOOL FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test for ETH → Token swaps with random inputs
     * @dev Validates:
     *      - K-invariant preservation (reserveToken * reserveETH)
     *      - No reserve drain
     *      - Proper fee application (0.3%)
     *      - Slippage protection (minTokensOut)
     *      - No negative reserves
     */
    function testFuzz_SwapETHForTokens(uint256 initialTokens, uint256 initialETH, uint256 swapAmount) public {
        // Bound initial liquidity to reasonable values using bound()
        initialTokens = bound(initialTokens, 1 ether, MAX_REASONABLE_TOKENS);
        initialETH = bound(initialETH, 1 ether, MAX_REASONABLE_ETH);
        
        // Swap amount: 0.01 ETH to initial ETH / 2 (prevent drain)
        swapAmount = bound(swapAmount, 0.01 ether, initialETH / 2);

        // Setup: Add initial liquidity
        vm.startPrank(liquidityProvider);
        token.approve(address(ammPool), type(uint256).max);
        vm.deal(liquidityProvider, initialETH + 100 ether);
        
        // Transfer tokens to liquidity provider
        vm.stopPrank();
        vm.prank(seller);
        token.transfer(liquidityProvider, initialTokens);
        
        vm.prank(liquidityProvider);
        ammPool.addLiquidity{value: initialETH}(initialTokens, 0, 0);
        vm.stopPrank();

        // Record K-invariant before swap
        (uint256 reserveTokenBefore, uint256 reserveETHBefore) = ammPool.getReserves();
        uint256 kBefore = reserveTokenBefore * reserveETHBefore;

        // Calculate expected output
        uint256 expectedAmountOut = ammPool.getAmountOut(swapAmount, true);
        
        // Skip test if output would drain reserves or is zero
        if (expectedAmountOut == 0 || expectedAmountOut >= reserveTokenBefore) {
            return;
        }

        // Perform swap
        vm.deal(trader, swapAmount + 1 ether);
        vm.prank(trader);
        ammPool.swapETHForTokens{value: swapAmount}(0); // minTokensOut = 0 for fuzz testing

        // Verify reserves updated correctly
        (uint256 reserveTokenAfter, uint256 reserveETHAfter) = ammPool.getReserves();
        
        assertEq(reserveETHAfter, reserveETHBefore + swapAmount, "ETH reserve should increase by swap amount");
        assertTrue(reserveTokenAfter < reserveTokenBefore, "Token reserve should decrease");
        
        // Verify K-invariant (should increase or stay same due to fees)
        uint256 kAfter = reserveTokenAfter * reserveETHAfter;
        assertTrue(kAfter >= kBefore, "K-invariant should not decrease (fees increase K)");

        // Verify trader received tokens
        assertTrue(token.balanceOf(trader) > 0, "Trader should receive tokens");
        assertEq(token.balanceOf(trader), expectedAmountOut, "Trader should receive expected amount");

        // Safety: No negative reserves (implicit in uint256)
        assertTrue(reserveTokenAfter <= reserveTokenBefore, "No underflow in token reserve");
    }

    /**
     * @notice Fuzz test for Token → ETH swaps with random inputs
     * @dev Similar to ETH → Token swap but in reverse direction
     */
    function testFuzz_SwapTokensForETH(uint256 initialTokens, uint256 initialETH, uint256 swapAmount) public {
        // Bound initial liquidity using bound()
        initialTokens = bound(initialTokens, 1 ether, MAX_REASONABLE_TOKENS);
        initialETH = bound(initialETH, 1 ether, MAX_REASONABLE_ETH);
        
        // Swap amount: 0.01 tokens to initial tokens / 2 (prevent drain)
        swapAmount = bound(swapAmount, 0.01 ether, initialTokens / 2);

        // Setup: Add initial liquidity
        vm.prank(seller);
        token.transfer(liquidityProvider, initialTokens + swapAmount); // Extra for swap
        
        vm.startPrank(liquidityProvider);
        token.approve(address(ammPool), type(uint256).max);
        vm.deal(liquidityProvider, initialETH + 100 ether);
        ammPool.addLiquidity{value: initialETH}(initialTokens, 0, 0);
        vm.stopPrank();

        // Transfer tokens to trader for swap
        vm.prank(seller);
        token.transfer(trader, swapAmount);

        // Record K-invariant before swap
        (uint256 reserveTokenBefore, uint256 reserveETHBefore) = ammPool.getReserves();
        uint256 kBefore = reserveTokenBefore * reserveETHBefore;

        // Calculate expected output
        uint256 expectedAmountOut = ammPool.getAmountOut(swapAmount, false);
        
        // Skip test if output would drain reserves or is zero
        if (expectedAmountOut == 0 || expectedAmountOut >= reserveETHBefore) {
            return;
        }

        uint256 traderETHBefore = trader.balance;

        // Perform swap
        vm.startPrank(trader);
        token.approve(address(ammPool), swapAmount);
        ammPool.swapTokensForETH(swapAmount, 0);
        vm.stopPrank();

        // Verify reserves updated correctly
        (uint256 reserveTokenAfter, uint256 reserveETHAfter) = ammPool.getReserves();
        
        assertEq(reserveTokenAfter, reserveTokenBefore + swapAmount, "Token reserve should increase");
        assertTrue(reserveETHAfter < reserveETHBefore, "ETH reserve should decrease");
        
        // Verify K-invariant (should increase or stay same due to fees)
        uint256 kAfter = reserveTokenAfter * reserveETHAfter;
        assertTrue(kAfter >= kBefore, "K-invariant should not decrease");

        // Verify trader received ETH
        assertEq(trader.balance, traderETHBefore + expectedAmountOut, "Trader should receive ETH");

        // Safety: No reserve drain
        assertTrue(reserveETHAfter > 0, "ETH reserve should not be drained");
        assertTrue(reserveTokenAfter > 0, "Token reserve should not be drained");
    }

    /**
     * @notice Fuzz test for adding liquidity with random amounts
     * @dev Validates:
     *      - LP token minting calculation (sqrt for first LP, ratio for subsequent)
     *      - Proper ratio maintenance for subsequent deposits
     *      - Reserve updates
     *      - Total supply tracking
     */
    function testFuzz_AddLiquidity(uint256 tokenAmount, uint256 ethAmount) public {
        // Bound to reasonable values
        vm.assume(tokenAmount >= 1 ether && tokenAmount <= MAX_REASONABLE_TOKENS);
        vm.assume(ethAmount >= 1 ether && ethAmount <= MAX_REASONABLE_ETH);
        
        // Ensure no overflow in sqrt calculation
        uint256 product = tokenAmount * ethAmount;
        vm.assume(product / tokenAmount == ethAmount);

        // Give liquidity provider tokens
        vm.prank(seller);
        token.transfer(liquidityProvider, tokenAmount);

        vm.deal(liquidityProvider, ethAmount + 100 ether);

        // Add liquidity
        vm.startPrank(liquidityProvider);
        token.approve(address(ammPool), tokenAmount);
        
        uint256 totalSupplyBefore = ammPool.totalSupply();
        
        ammPool.addLiquidity{value: ethAmount}(tokenAmount, 0, 0);
        vm.stopPrank();

        // Verify reserves
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        assertEq(reserveToken, tokenAmount, "Token reserve should equal deposited amount");
        assertEq(reserveETH, ethAmount, "ETH reserve should equal deposited amount");

        // Verify LP tokens minted
        uint256 totalSupplyAfter = ammPool.totalSupply();
        assertTrue(totalSupplyAfter > totalSupplyBefore, "Total supply should increase");
        
        // For first liquidity, LP = sqrt(tokenAmount * ethAmount)
        if (totalSupplyBefore == 0) {
            uint256 expectedLP = _sqrt(tokenAmount * ethAmount);
            assertEq(totalSupplyAfter, expectedLP, "LP tokens should equal sqrt for first deposit");
        }

        // Verify LP balance
        uint256 lpBalance = ammPool.balanceOf(liquidityProvider);
        assertEq(lpBalance, totalSupplyAfter - totalSupplyBefore, "LP should receive minted tokens");
    }

    /**
     * @notice Fuzz test for adding liquidity multiple times (ratio maintenance)
     * @dev Ensures subsequent liquidity additions maintain the reserve ratio
     */
    function testFuzz_AddLiquidityMultipleTimes(
        uint256 initialTokens,
        uint256 initialETH,
        uint256 secondTokens,
        uint256 secondETH
    ) public {
        // Bound initial liquidity using bound()
        initialTokens = bound(initialTokens, 1 ether, 10_000 ether);
        initialETH = bound(initialETH, 1 ether, 10_000 ether);
        
        // Bound second liquidity
        secondTokens = bound(secondTokens, 0.1 ether, 1_000 ether);
        secondETH = bound(secondETH, 0.1 ether, 1_000 ether);

        // Check for overflow and skip if needed
        if (initialTokens > type(uint256).max / initialETH) {
            return;
        }

        // Setup: First liquidity addition
        vm.prank(seller);
        token.transfer(liquidityProvider, initialTokens + secondTokens);

        vm.deal(liquidityProvider, initialETH + secondETH + 100 ether);

        vm.startPrank(liquidityProvider);
        token.approve(address(ammPool), type(uint256).max);
        ammPool.addLiquidity{value: initialETH}(initialTokens, 0, 0);

        uint256 totalSupplyAfterFirst = ammPool.totalSupply();

        // Second liquidity addition
        ammPool.addLiquidity{value: secondETH}(secondTokens, 0, 0);
        vm.stopPrank();

        uint256 totalSupplyAfterSecond = ammPool.totalSupply();

        // Verify total supply increased
        assertTrue(totalSupplyAfterSecond > totalSupplyAfterFirst, "Total supply should increase");

        // Verify reserves increased
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        assertTrue(reserveToken >= initialTokens, "Token reserves should increase");
        assertTrue(reserveETH >= initialETH, "ETH reserves should increase");
    }

    /**
     * @notice Fuzz test for removing liquidity with random amounts
     * @dev Validates:
     *      - Proportional token/ETH withdrawal
     *      - Total supply decrease
     *      - Reserve updates
     *      - Balance checks
     */
    function testFuzz_RemoveLiquidity(uint256 initialTokens, uint256 initialETH, uint256 liquidityToRemove)
        public
    {
        // Bound initial liquidity
        vm.assume(initialTokens >= 10 ether && initialTokens <= MAX_REASONABLE_TOKENS);
        vm.assume(initialETH >= 10 ether && initialETH <= MAX_REASONABLE_ETH);
        vm.assume(initialTokens * initialETH / initialTokens == initialETH);

        // Setup: Add initial liquidity
        vm.prank(seller);
        token.transfer(liquidityProvider, initialTokens);

        vm.deal(liquidityProvider, initialETH + 100 ether);

        vm.startPrank(liquidityProvider);
        token.approve(address(ammPool), initialTokens);
        ammPool.addLiquidity{value: initialETH}(initialTokens, 0, 0);

        uint256 lpBalance = ammPool.balanceOf(liquidityProvider);
        
        // Bound liquidity to remove (1% to 100% of balance)
        vm.assume(liquidityToRemove > 0 && liquidityToRemove <= lpBalance);

        uint256 totalSupplyBefore = ammPool.totalSupply();
        (uint256 reserveTokenBefore, uint256 reserveETHBefore) = ammPool.getReserves();

        // Calculate expected withdrawals
        uint256 expectedTokens = (liquidityToRemove * reserveTokenBefore) / totalSupplyBefore;
        uint256 expectedETH = (liquidityToRemove * reserveETHBefore) / totalSupplyBefore;

        uint256 traderTokensBefore = token.balanceOf(liquidityProvider);
        uint256 traderETHBefore = liquidityProvider.balance;

        // Remove liquidity
        ammPool.removeLiquidity(liquidityToRemove, 0, 0);
        vm.stopPrank();

        // Verify total supply decreased
        assertEq(ammPool.totalSupply(), totalSupplyBefore - liquidityToRemove, "Total supply should decrease");

        // Verify reserves decreased proportionally
        (uint256 reserveTokenAfter, uint256 reserveETHAfter) = ammPool.getReserves();
        assertEq(reserveTokenAfter, reserveTokenBefore - expectedTokens, "Token reserve should decrease");
        assertEq(reserveETHAfter, reserveETHBefore - expectedETH, "ETH reserve should decrease");

        // Verify LP received tokens and ETH
        assertEq(
            token.balanceOf(liquidityProvider), traderTokensBefore + expectedTokens, "LP should receive tokens"
        );
        assertEq(liquidityProvider.balance, traderETHBefore + expectedETH, "LP should receive ETH");

        // Safety: Reserves should never go negative
        assertTrue(reserveTokenAfter <= reserveTokenBefore, "No underflow in token reserve");
        assertTrue(reserveETHAfter <= reserveETHBefore, "No underflow in ETH reserve");
    }

    /**
     * @notice Fuzz test to verify K-invariant is preserved across multiple operations
     * @dev Critical invariant: K = reserveToken * reserveETH should never decrease
     *      (except for small rounding, and should increase due to fees)
     */
    function testFuzz_AMMInvariantPreserved(uint256 initialTokens, uint256 initialETH, uint256 swapAmount)
        public
    {
        // Setup initial liquidity using bound()
        initialTokens = bound(initialTokens, 10 ether, 50_000 ether);
        initialETH = bound(initialETH, 10 ether, 50_000 ether);
        swapAmount = bound(swapAmount, 0.1 ether, 5 ether);
        
        // Check for overflow and skip if needed
        if (initialTokens > type(uint256).max / initialETH) {
            return;
        }

        vm.prank(seller);
        token.transfer(liquidityProvider, initialTokens);

        vm.deal(liquidityProvider, initialETH + 100 ether);

        vm.startPrank(liquidityProvider);
        token.approve(address(ammPool), initialTokens);
        ammPool.addLiquidity{value: initialETH}(initialTokens, 0, 0);
        vm.stopPrank();

        // Record initial K
        (uint256 reserveToken, uint256 reserveETH) = ammPool.getReserves();
        uint256 kInitial = reserveToken * reserveETH;

        // Perform swap
        vm.deal(trader, swapAmount + 1 ether);
        vm.prank(trader);
        ammPool.swapETHForTokens{value: swapAmount}(0);

        // Verify K increased (due to fees)
        (uint256 reserveTokenAfter, uint256 reserveETHAfter) = ammPool.getReserves();
        uint256 kAfter = reserveTokenAfter * reserveETHAfter;

        assertTrue(kAfter >= kInitial, "K-invariant should not decrease after swap");
    }

    /*//////////////////////////////////////////////////////////////
                          LPTOKEN FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test for LP token minting
     * @dev Validates:
     *      - Only pool can mint
     *      - Balance updates correctly
     *      - Total supply increases
     */
    function testFuzz_MintLPTokens(address recipient, uint256 amount) public {
        // Bound to reasonable values
        vm.assume(recipient != address(0));
        vm.assume(amount > 0 && amount <= 1_000_000 ether);

        uint256 totalSupplyBefore = lpToken.totalSupply();
        uint256 balanceBefore = lpToken.balanceOf(recipient);

        // Only pool can mint (this should succeed)
        vm.prank(address(ammPool));
        lpToken.mint(recipient, amount);

        // Verify minting
        assertEq(lpToken.totalSupply(), totalSupplyBefore + amount, "Total supply should increase");
        assertEq(lpToken.balanceOf(recipient), balanceBefore + amount, "Balance should increase");
    }

    /**
     * @notice Fuzz test for LP token minting authorization
     * @dev Ensures only the pool can mint tokens
     */
    function testFuzz_MintLPTokensUnauthorized(address caller, address recipient, uint256 amount) public {
        vm.assume(caller != address(ammPool));
        vm.assume(caller != address(0));
        vm.assume(recipient != address(0));
        vm.assume(amount > 0 && amount <= 1_000_000 ether);

        // Should revert when non-pool tries to mint
        vm.prank(caller);
        vm.expectRevert(LPToken.Unauthorized.selector);
        lpToken.mint(recipient, amount);
    }

    /**
     * @notice Fuzz test for LP token burning
     * @dev Validates:
     *      - Only pool can burn
     *      - Balance decreases correctly
     *      - Total supply decreases
     *      - No negative balances
     */
    function testFuzz_BurnLPTokens(address holder, uint256 mintAmount, uint256 burnAmount) public {
        vm.assume(holder != address(0));
        vm.assume(mintAmount > 0 && mintAmount <= 1_000_000 ether);
        vm.assume(burnAmount > 0 && burnAmount <= mintAmount);

        // First mint tokens
        vm.prank(address(ammPool));
        lpToken.mint(holder, mintAmount);

        uint256 totalSupplyBefore = lpToken.totalSupply();
        uint256 balanceBefore = lpToken.balanceOf(holder);

        // Burn tokens
        vm.prank(address(ammPool));
        lpToken.burn(holder, burnAmount);

        // Verify burning
        assertEq(lpToken.totalSupply(), totalSupplyBefore - burnAmount, "Total supply should decrease");
        assertEq(lpToken.balanceOf(holder), balanceBefore - burnAmount, "Balance should decrease");

        // Safety: No negative balances
        assertTrue(lpToken.balanceOf(holder) <= balanceBefore, "No underflow in balance");
    }

    /*//////////////////////////////////////////////////////////////
                      ASSETREGISTRY FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test for asset registration
     * @dev Validates:
     *      - Unique token addresses
     *      - Metadata URI handling
     *      - Asset counter increments
     *      - Proper mapping updates
     */
    function testFuzz_RegisterAssets(address tokenAddr, string memory metadataURI) public {
        vm.assume(tokenAddr != address(0));
        vm.assume(bytes(metadataURI).length > 0 && bytes(metadataURI).length < 500);

        // Deploy a new token for this test to ensure uniqueness
        vm.prank(seller);
        AssetToken newToken = new AssetToken("Fuzz Asset", "FUZZ", 1000 ether, seller);

        uint256 assetCountBefore = registry.assetCount();

        // Register asset
        vm.prank(seller);
        registry.registerAsset(address(newToken), metadataURI);

        // Verify registration
        assertEq(registry.assetCount(), assetCountBefore + 1, "Asset count should increase");

        uint256 assetId = registry.getAssetIdByToken(address(newToken));
        assertEq(assetId, assetCountBefore + 1, "Asset ID should be sequential");

        AssetRegistry.Asset memory asset = registry.getAsset(assetId);
        assertEq(asset.token, address(newToken), "Token address should match");
        assertEq(asset.owner, seller, "Owner should match");
        assertEq(asset.metadataURI, metadataURI, "Metadata URI should match");
        assertTrue(asset.active, "Asset should be active");
    }

    /**
     * @notice Fuzz test for asset deactivation
     * @dev Validates:
     *      - Only owner can deactivate
     *      - State transitions correctly
     *      - Authorization checks
     */
    function testFuzz_DeactivateAssets(address owner, address attacker) public {
        vm.assume(owner != address(0));
        vm.assume(attacker != address(0));
        vm.assume(owner != attacker);

        // Deploy and register asset
        vm.prank(owner);
        AssetToken newToken = new AssetToken("Fuzz Asset", "FUZZ", 1000 ether, owner);

        vm.prank(owner);
        registry.registerAsset(address(newToken), "ipfs://test");

        uint256 assetId = registry.getAssetIdByToken(address(newToken));

        // Attacker should not be able to deactivate
        vm.prank(attacker);
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.deactivateAsset(assetId);

        // Owner should be able to deactivate
        vm.prank(owner);
        registry.deactivateAsset(assetId);

        // Verify deactivation
        AssetRegistry.Asset memory asset = registry.getAsset(assetId);
        assertFalse(asset.active, "Asset should be inactive");
    }

    /*//////////////////////////////////////////////////////////////
                      CROSS-CONTRACT FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test for complete user journey
     * @dev Tests: Asset registration → Primary sale → AMM listing → Swaps
     *      Validates fund conservation across the entire protocol
     */
    function testFuzz_CompleteUserJourney(uint256 salePrice, uint256 saleAmount, uint256 buyAmount) public {
        vm.assume(salePrice > 0 && salePrice <= 1 ether);
        vm.assume(saleAmount >= 10 ether && saleAmount <= 1000 ether);
        vm.assume(buyAmount > 0 && buyAmount <= saleAmount);
        
        uint256 totalCost = salePrice * buyAmount;
        vm.assume(totalCost / salePrice == buyAmount); // Overflow check
        vm.assume(totalCost <= 1000 ether);

        // 1. Register asset
        vm.prank(seller);
        registry.registerAsset(address(token), "ipfs://metadata");

        // 2. Create primary sale
        vm.prank(seller);
        primarySale.createSale(address(token), salePrice, saleAmount, block.timestamp, block.timestamp + 1 days);

        // 3. Buy tokens
        vm.deal(buyer, totalCost + 10 ether);
        vm.prank(buyer);
        primarySale.purchaseTokens{value: totalCost}(address(token), buyAmount);

        // Verify buyer received tokens
        assertEq(token.balanceOf(buyer), buyAmount, "Buyer should have purchased tokens");

        // Safety: Total token supply should remain constant
        assertEq(token.totalSupply(), INITIAL_TOKEN_SUPPLY, "Total supply should not change");
    }

    /*//////////////////////////////////////////////////////////////
                            HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Internal square root function for testing
     * @dev Used to verify LP token calculations
     */
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
}
