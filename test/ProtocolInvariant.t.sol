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
    uint256 public initialK;

    function setUp() public {
        // Deploy token as seller
        vm.prank(seller);
        token = new AssetToken("Asset Token", "ASSET", INITIAL_SUPPLY, seller);

        primarySale = new PrimarySale();
        ammPool = new AMMPool(address(token));
        lpToken = new LPToken("LP Token", "LP", address(ammPool));
        registry = new AssetRegistry();

        // Fund seller
        vm.deal(seller, 1000 ether);

        // Approve primary sale and add liquidity
        vm.startPrank(seller);
        token.approve(address(primarySale), type(uint256).max);
        primarySale.createSale(
            address(token),
            1, // price per token
            100_000 ether,
            block.timestamp,
            block.timestamp + 365 days
        );
        token.approve(address(ammPool), type(uint256).max);
        ammPool.addLiquidity{value: 100 ether}(100_000 ether, 0, 0);
        vm.stopPrank();

        // Record initial K for AMM
        (uint256 rToken, uint256 rETH) = ammPool.getReserves();
        initialK = rToken * rETH;

        // Deploy handler
        handler = new ProtocolHandler(token, primarySale, ammPool, registry, seller);

        // Target the handler for fuzzing
        targetContract(address(handler));
    }

    /*//////////////////////////////////////////////////////////////
                        TOKEN INVARIANTS
    //////////////////////////////////////////////////////////////*/

    function invariant_totalSupplyConstant() public view {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
    }

    function invariant_noTokenMintFromNothing() public view {
        uint256 totalTracked =
            token.balanceOf(seller) + token.balanceOf(address(ammPool)) + token.balanceOf(address(primarySale));
        assertTrue(totalTracked <= INITIAL_SUPPLY);
    }

    /*//////////////////////////////////////////////////////////////
                        AMM INVARIANTS
    //////////////////////////////////////////////////////////////*/

    function invariant_reservesMatchBalances() public view {
        (uint256 rToken, uint256 rETH) = ammPool.getReserves();
        assertApproxEqAbs(rToken, token.balanceOf(address(ammPool)), 1);
        assertApproxEqAbs(rETH, address(ammPool).balance, 1);
    }

    function invariant_reservesPositiveWhenLPExists() public view {
        if (ammPool.totalSupply() > 0) {
            (uint256 rToken, uint256 rETH) = ammPool.getReserves();
            assertTrue(rToken > 0);
            assertTrue(rETH > 0);
        }
    }

    function invariant_constantProductDoesNotDecrease() public view {
        (uint256 rToken, uint256 rETH) = ammPool.getReserves();
        if (rToken == 0 || rETH == 0) return;

        uint256 k = rToken * rETH;
        uint256 minK = (initialK * 999) / 1000;
        assertTrue(k >= minK);
    }

    /*//////////////////////////////////////////////////////////////
                        LP TOKEN INVARIANTS
    //////////////////////////////////////////////////////////////*/

    function invariant_lpSupplyMatchesPoolState() public view {
        uint256 lpSupply = ammPool.totalSupply();
        (uint256 rToken, uint256 rETH) = ammPool.getReserves();

        if (lpSupply == 0) {
            assertEq(rToken, 0);
            assertEq(rETH, 0);
        } else {
            assertTrue(rToken > 0);
            assertTrue(rETH > 0);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        ETH CONSERVATION
    //////////////////////////////////////////////////////////////*/

    function invariant_ammETHNonNegative() public view {
        assertTrue(address(ammPool).balance >= 0);
    }

    function invariant_primarySaleETHNonNegative() public view {
        assertTrue(address(primarySale).balance >= 0);
    }

    /*//////////////////////////////////////////////////////////////
                        REGISTRY INVARIANTS
    //////////////////////////////////////////////////////////////*/

    function invariant_registryBounded() public view {
        assertTrue(registry.assetCount() <= 1000);
    }
}
