// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../src/interfaces/AggregatorV3Interface.sol";

contract MockAggregatorV3 is AggregatorV3Interface {
    uint8 private _decimals;
    string private _description;
    uint256 private _version;
    int256 private _price;
    uint256 private _updatedAt;
    uint80 private _roundId;
    uint80 private _answeredInRound;

    constructor(uint8 decimals_, int256 price_) {
        require(price_ > 0, "Price must be positive");
        _decimals = decimals_;
        _price = price_;
        _description = "Mock Price Feed";
        _version = 1;
        _updatedAt = block.timestamp > 0 ? block.timestamp : 1; // Ensure never 0
        _roundId = 1;
        _answeredInRound = 1; // Ensure answeredInRound >= roundId
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return _description;
    }

    function version() external view override returns (uint256) {
        return _version;
    }

    function getRoundData(uint80) external view override returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) {
        // Ensure startedAt doesn't underflow
        uint256 startedAtTime = block.timestamp >= 1 hours ? block.timestamp - 1 hours : block.timestamp;
        return (_roundId, _price, startedAtTime, _updatedAt, _answeredInRound);
    }

    function latestRoundData() external view override returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) {
        // Ensure startedAt doesn't underflow
        uint256 startedAtTime = block.timestamp >= 1 hours ? block.timestamp - 1 hours : block.timestamp;
        // Return actual values (not forced to be valid) so tests can check invalid scenarios
        // But ensure startedAt never underflows
        return (_roundId, _price, startedAtTime, _updatedAt, _answeredInRound);
    }

    // Helper functions for testing
    function setPrice(int256 newPrice) external {
        _price = newPrice;
        _updatedAt = block.timestamp;
        _roundId++;
        _answeredInRound = _roundId;
    }

    function setStale() external {
        // Make it stale by ensuring answeredInRound < roundId
        if (_roundId > 0) {
            _answeredInRound = _roundId - 1;
        } else {
            _answeredInRound = 0;
            _roundId = 1; // Ensure roundId is at least 1
        }
    }

    function setInvalid() external {
        _price = -1; // Invalid price
    }

    function setZeroUpdatedAt() external {
        _updatedAt = 0;
    }
}

