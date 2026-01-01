// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/AggregatorV3Interface.sol";

contract OraclePriceFeed {
    mapping(address => address) public tokenPriceFeed;

    error InvalidPriceFeed();
    error PriceFeedNotFound();
    error StalePrice();
    error InvalidPrice();

    event PriceFeedSet(address indexed token, address indexed priceFeed);

    function setPriceFeed(address token, address priceFeed) external {
        if (priceFeed == address(0)) {
            revert InvalidPriceFeed();
        }
        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);
        try feed.latestRoundData() returns (uint80, int256, uint256, uint256, uint80) {}
        catch {
            revert InvalidPriceFeed();
        }
        tokenPriceFeed[token] = priceFeed;
        emit PriceFeedSet(token, priceFeed);
    }

    function getPrice(address token) external view returns (int256, uint8) {
        address feedAddress = tokenPriceFeed[token];
        if (feedAddress == address(0)) {
            revert PriceFeedNotFound();
        }

        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);
        (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) =
            priceFeed.latestRoundData();

        if (price <= 0) {
            revert InvalidPrice();
        }
        if (updatedAt == 0 || answeredInRound < roundId) {
            revert StalePrice();
        }

        uint8 decimals = priceFeed.decimals();
        return (price, decimals);
    }

    function getLatestRoundData(address token)
        external
        view
        returns (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        address feedAddress = tokenPriceFeed[token];
        if (feedAddress == address(0)) {
            revert PriceFeedNotFound();
        }

        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);
        (roundId, price, startedAt, updatedAt, answeredInRound) = priceFeed.latestRoundData();
    }
}

