// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetRegistry.sol";
import "../src/AssetToken.sol";

contract AssetRegistryTest is Test {
    AssetRegistry registry;
    AssetToken token1;
    AssetToken token2;

    address owner1 = address(1);
    address owner2 = address(2);
    address user = address(3);

    string constant METADATA_URI_1 = "ipfs://QmHash1";
    string constant METADATA_URI_2 = "ipfs://QmHash2";

    function setUp() public {
        registry = new AssetRegistry();

        vm.prank(owner1);
        token1 = new AssetToken("Token 1", "TKN1", 1000 ether, owner1);

        vm.prank(owner2);
        token2 = new AssetToken("Token 2", "TKN2", 2000 ether, owner2);
    }

    // ============ registerAsset Tests ============

    function test_RegisterAsset_Success() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        assertEq(registry.assetCount(), 1);
        assertEq(registry.tokenToAssetId(address(token1)), 1);

        AssetRegistry.Asset memory asset = registry.getAsset(1);
        assertEq(asset.token, address(token1));
        assertEq(asset.owner, owner1);
        assertEq(asset.metadataURI, METADATA_URI_1);
        assertTrue(asset.active);
    }

    function test_RegisterAsset_Event() public {
        vm.prank(owner1);
        vm.expectEmit(true, true, false, true);
        emit AssetRegistry.AssetRegistered(1, address(token1), owner1, METADATA_URI_1);
        registry.registerAsset(address(token1), METADATA_URI_1);
    }

    function test_RegisterAsset_MultipleAssets() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        vm.prank(owner2);
        registry.registerAsset(address(token2), METADATA_URI_2);

        assertEq(registry.assetCount(), 2);
        assertEq(registry.tokenToAssetId(address(token1)), 1);
        assertEq(registry.tokenToAssetId(address(token2)), 2);
    }

    function test_RegisterAsset_RevertWhen_InvalidToken() public {
        vm.prank(owner1);
        vm.expectRevert(AssetRegistry.InvalidToken.selector);
        registry.registerAsset(address(0), METADATA_URI_1);
    }

    function test_RegisterAsset_RevertWhen_InvalidMetadataURI() public {
        vm.prank(owner1);
        vm.expectRevert(AssetRegistry.InvalidMetadataURI.selector);
        registry.registerAsset(address(token1), "");
    }

    function test_RegisterAsset_RevertWhen_TokenAlreadyRegistered() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        vm.prank(owner1);
        vm.expectRevert(AssetRegistry.TokenAlreadyRegistered.selector);
        registry.registerAsset(address(token1), METADATA_URI_2);
    }

    // ============ deactivateAsset Tests ============

    function test_DeactivateAsset_Success() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        vm.prank(owner1);
        registry.deactivateAsset(1);

        AssetRegistry.Asset memory asset = registry.getAsset(1);
        assertFalse(asset.active);
    }

    function test_DeactivateAsset_Event() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        vm.prank(owner1);
        vm.expectEmit(true, true, false, false);
        emit AssetRegistry.AssetDeactivated(1, address(token1));
        registry.deactivateAsset(1);
    }

    function test_DeactivateAsset_RevertWhen_Unauthorized() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        vm.prank(owner2);
        vm.expectRevert(AssetRegistry.Unauthorized.selector);
        registry.deactivateAsset(1);
    }

    function test_DeactivateAsset_RevertWhen_AssetNotFound() public {
        vm.prank(owner1);
        vm.expectRevert(AssetRegistry.AssetNotFound.selector);
        registry.deactivateAsset(1);
    }

    function test_DeactivateAsset_RevertWhen_AssetNotActive() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        vm.prank(owner1);
        registry.deactivateAsset(1);

        vm.prank(owner1);
        vm.expectRevert(AssetRegistry.AssetNotActive.selector);
        registry.deactivateAsset(1);
    }

    // ============ getAsset Tests ============

    function test_GetAsset_Success() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        AssetRegistry.Asset memory asset = registry.getAsset(1);
        assertEq(asset.token, address(token1));
        assertEq(asset.owner, owner1);
        assertEq(asset.metadataURI, METADATA_URI_1);
        assertTrue(asset.active);
    }

    function test_GetAsset_RevertWhen_AssetNotFound() public {
        vm.expectRevert(AssetRegistry.AssetNotFound.selector);
        registry.getAsset(1);
    }

    function test_GetAsset_RevertWhen_InvalidAssetId() public {
        vm.expectRevert(AssetRegistry.AssetNotFound.selector);
        registry.getAsset(0);
    }

    // ============ getAssetIdByToken Tests ============

    function test_GetAssetIdByToken_Success() public {
        vm.prank(owner1);
        registry.registerAsset(address(token1), METADATA_URI_1);

        uint256 assetId = registry.getAssetIdByToken(address(token1));
        assertEq(assetId, 1);
    }

    function test_GetAssetIdByToken_RevertWhen_TokenNotRegistered() public {
        vm.expectRevert(AssetRegistry.AssetNotFound.selector);
        registry.getAssetIdByToken(address(token1));
    }
}

