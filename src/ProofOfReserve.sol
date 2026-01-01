// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/AggregatorV3Interface.sol";

contract ProofOfReserve {
    mapping(address => address) public tokenReserveFeed;
    mapping(address => uint256) public tokenTotalSupply;
    uint256 public constant MAX_DEVIATION_BPS = 500; // 5% deviation allowed

    error InvalidReserveFeed();
    error ReserveFeedNotFound();
    error StaleReserve();
    error InvalidReserve();
    error ReserveDeviationExceeded();
    error InvalidTotalSupply();

    event ReserveFeedSet(address indexed token, address indexed reserveFeed);
    event TotalSupplySet(address indexed token, uint256 totalSupply);
    event ReserveVerified(address indexed token, uint256 reserve, uint256 totalSupply, bool isValid);

    function setReserveFeed(address token, address reserveFeed) external {
        if (reserveFeed == address(0)) {
            revert InvalidReserveFeed();
        }
        AggregatorV3Interface feed = AggregatorV3Interface(reserveFeed);
        try feed.latestRoundData() returns (uint80, int256, uint256, uint256, uint80) {}
        catch {
            revert InvalidReserveFeed();
        }
        tokenReserveFeed[token] = reserveFeed;
        emit ReserveFeedSet(token, reserveFeed);
    }

    function setTotalSupply(address token, uint256 totalSupply) external {
        if (totalSupply == 0) {
            revert InvalidTotalSupply();
        }
        tokenTotalSupply[token] = totalSupply;
        emit TotalSupplySet(token, totalSupply);
    }

    function getReserve(address token) external view returns (int256, uint8) {
        address feedAddress = tokenReserveFeed[token];
        if (feedAddress == address(0)) {
            revert ReserveFeedNotFound();
        }

        AggregatorV3Interface reserveFeed = AggregatorV3Interface(feedAddress);
        (uint80 roundId, int256 reserve, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) =
            reserveFeed.latestRoundData();

        if (reserve <= 0) {
            revert InvalidReserve();
        }
        if (updatedAt == 0 || answeredInRound < roundId) {
            revert StaleReserve();
        }

        uint8 decimals = reserveFeed.decimals();
        return (reserve, decimals);
    }

    function checkReserve(address token)
        public
        view
        returns (uint256 reserveAmount, uint256 totalSupply, bool isValid)
    {
        address feedAddress = tokenReserveFeed[token];
        if (feedAddress == address(0)) {
            revert ReserveFeedNotFound();
        }

        totalSupply = tokenTotalSupply[token];
        if (totalSupply == 0) {
            revert InvalidTotalSupply();
        }

        AggregatorV3Interface reserveFeed = AggregatorV3Interface(feedAddress);
        (uint80 roundId, int256 reserve,, uint256 updatedAt, uint80 answeredInRound) = reserveFeed.latestRoundData();

        if (reserve <= 0) revert InvalidReserve();
        if (updatedAt == 0 || answeredInRound < roundId) revert StaleReserve();

        reserveAmount = uint256(reserve);

        uint256 deviation = reserveAmount > totalSupply
            ? ((reserveAmount - totalSupply) * 10000) / totalSupply
            : ((totalSupply - reserveAmount) * 10000) / totalSupply;

        isValid = deviation <= MAX_DEVIATION_BPS;
    }

    function verifyReserve(address token) external returns (bool) {
        (uint256 reserveAmount, uint256 totalSupply, bool isValid) = checkReserve(token);

        emit ReserveVerified(token, reserveAmount, totalSupply, isValid);
        return isValid;
    }

    function getLatestReserveData(address token)
        external
        view
        returns (uint80 roundId, int256 reserve, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        address feedAddress = tokenReserveFeed[token];
        if (feedAddress == address(0)) {
            revert ReserveFeedNotFound();
        }

        AggregatorV3Interface reserveFeed = AggregatorV3Interface(feedAddress);
        (roundId, reserve, startedAt, updatedAt, answeredInRound) = reserveFeed.latestRoundData();
    }
}

