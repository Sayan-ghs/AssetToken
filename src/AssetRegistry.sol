// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssetRegistry {
    struct Asset {
        address token;
        address owner;
        string metadataURI;
        bool active;
    }

    mapping(uint256 => Asset) public assets;
    mapping(address => uint256) public tokenToAssetId;
    uint256 public assetCount;

    error InvalidToken();
    error InvalidMetadataURI();
    error TokenAlreadyRegistered();
    error Unauthorized();
    error AssetNotActive();
    error AssetNotFound();

    event AssetRegistered(uint256 indexed assetId, address indexed token, address indexed owner, string metadataURI);

    event AssetDeactivated(uint256 indexed assetId, address indexed token);

    function registerAsset(address token, string memory metadataURI) external {
        if (token == address(0)) {
            revert InvalidToken();
        }
        if (bytes(metadataURI).length == 0) {
            revert InvalidMetadataURI();
        }
        if (tokenToAssetId[token] != 0) {
            revert TokenAlreadyRegistered();
        }

        assetCount++;
        assets[assetCount] = Asset({token: token, owner: msg.sender, metadataURI: metadataURI, active: true});
        tokenToAssetId[token] = assetCount;

        emit AssetRegistered(assetCount, token, msg.sender, metadataURI);
    }

    function deactivateAsset(uint256 assetId) external {
        if (assetId == 0 || assetId > assetCount) {
            revert AssetNotFound();
        }
        Asset storage asset = assets[assetId];
        if (asset.owner != msg.sender) {
            revert Unauthorized();
        }
        if (!asset.active) {
            revert AssetNotActive();
        }

        asset.active = false;
        emit AssetDeactivated(assetId, asset.token);
    }

    function getAsset(uint256 assetId) external view returns (Asset memory) {
        if (assetId == 0 || assetId > assetCount) {
            revert AssetNotFound();
        }
        return assets[assetId];
    }

    function getAssetIdByToken(address token) external view returns (uint256) {
        uint256 assetId = tokenToAssetId[token];
        if (assetId == 0) {
            revert AssetNotFound();
        }
        return assetId;
    }
}
