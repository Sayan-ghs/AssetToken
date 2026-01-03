// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AssetToken.sol";

contract DeployAssetToken is Script {
    function run() external returns (AssetToken) {
        // Retrieve private key from environment variable
        // Make sure PRIVATE_KEY is set in your .env file
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        AssetToken token = new AssetToken(
            "Demo Asset Token",
            "DAT",
            1_000_000 * 10 ** 18, // 1 million tokens
            deployer
        );

        vm.stopBroadcast();

        console.log("AssetToken deployed at:", address(token));

        return token;
    }
}
