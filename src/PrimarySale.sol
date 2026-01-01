// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PrimarySale {
    struct Sale {
        address token;
        address seller;
        uint256 pricePerToken;
        uint256 tokensForSale;
        uint256 tokensSold;
        uint256 fundsWithdrawn;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool finalized;
    }

    mapping(address => Sale) public sales;
    mapping(address => mapping(address => uint256)) public purchases;

    error InvalidToken();
    error InvalidPrice();
    error InvalidAmount();
    error InvalidTimeRange();
    error SaleNotFound();
    error SaleNotActive();
    error SaleEnded();
    error SaleNotEnded();
    error InsufficientTokens();
    error InsufficientPayment();
    error TransferFailed();
    error SaleAlreadyExists();
    error Unauthorized();

    event SaleCreated(
        address indexed token,
        address indexed seller,
        uint256 pricePerToken,
        uint256 tokensForSale,
        uint256 startTime,
        uint256 endTime
    );

    event TokensPurchased(address indexed token, address indexed buyer, uint256 amount, uint256 totalCost);

    event SaleFinalized(address indexed token, uint256 totalRaised);
    event FundsWithdrawn(address indexed token, address indexed seller, uint256 amount);

    function createSale(address token, uint256 pricePerToken, uint256 tokensForSale, uint256 startTime, uint256 endTime)
        external
    {
        if (token == address(0)) {
            revert InvalidToken();
        }
        if (pricePerToken == 0) {
            revert InvalidPrice();
        }
        if (tokensForSale == 0) {
            revert InvalidAmount();
        }
        if (startTime >= endTime || endTime <= block.timestamp) {
            revert InvalidTimeRange();
        }
        if (sales[token].seller != address(0)) {
            revert SaleAlreadyExists();
        }

        IERC20 tokenContract = IERC20(token);
        if (tokenContract.balanceOf(msg.sender) < tokensForSale) {
            revert InsufficientTokens();
        }

        sales[token] = Sale({
            token: token,
            seller: msg.sender,
            pricePerToken: pricePerToken,
            tokensForSale: tokensForSale,
            tokensSold: 0,
            fundsWithdrawn: 0,
            startTime: startTime,
            endTime: endTime,
            active: true,
            finalized: false
        });

        emit SaleCreated(token, msg.sender, pricePerToken, tokensForSale, startTime, endTime);
    }

    function purchaseTokens(address token, uint256 tokenAmount) external payable {
        Sale storage sale = sales[token];
        if (sale.seller == address(0)) {
            revert SaleNotFound();
        }
        if (!sale.active) {
            revert SaleNotActive();
        }
        if (block.timestamp < sale.startTime || block.timestamp >= sale.endTime) {
            revert SaleEnded();
        }
        if (sale.tokensSold + tokenAmount > sale.tokensForSale) {
            revert InsufficientTokens();
        }

        uint256 totalCost = sale.pricePerToken * tokenAmount;
        if (msg.value < totalCost) {
            revert InsufficientPayment();
        }

        IERC20 tokenContract = IERC20(token);
        bool success = tokenContract.transferFrom(sale.seller, msg.sender, tokenAmount);
        if (!success) {
            revert TransferFailed();
        }

        sale.tokensSold += tokenAmount;
        purchases[token][msg.sender] += tokenAmount;

        if (msg.value > totalCost) {
            (bool refundSuccess,) = payable(msg.sender).call{value: msg.value - totalCost}("");
            if (!refundSuccess) {
                revert TransferFailed();
            }
        }

        emit TokensPurchased(token, msg.sender, tokenAmount, totalCost);
    }

    function finalizeSale(address token) external {
        Sale storage sale = sales[token];
        if (sale.seller == address(0)) {
            revert SaleNotFound();
        }
        if (sale.seller != msg.sender) {
            revert Unauthorized();
        }
        if (sale.finalized) {
            revert SaleNotActive();
        }
        if (block.timestamp < sale.endTime) {
            revert SaleNotEnded();
        }

        sale.active = false;
        sale.finalized = true;

        uint256 totalRaised = sale.tokensSold * sale.pricePerToken;
        emit SaleFinalized(token, totalRaised);
    }

    function withdrawFunds(address token) external {
        Sale storage sale = sales[token];
        if (sale.seller == address(0)) {
            revert SaleNotFound();
        }
        if (sale.seller != msg.sender) {
            revert Unauthorized();
        }
        if (!sale.finalized) {
            revert SaleNotEnded();
        }

        uint256 totalRaised = sale.tokensSold * sale.pricePerToken;
        uint256 withdrawable = totalRaised - sale.fundsWithdrawn;
        if (withdrawable == 0) {
            revert InvalidAmount();
        }

        sale.fundsWithdrawn = totalRaised;

        (bool success,) = payable(msg.sender).call{value: withdrawable}("");
        if (!success) {
            revert TransferFailed();
        }

        emit FundsWithdrawn(token, msg.sender, withdrawable);
    }

    function getSale(address token) external view returns (Sale memory) {
        if (sales[token].seller == address(0)) {
            revert SaleNotFound();
        }
        return sales[token];
    }

    function getPurchaseAmount(address token, address buyer) external view returns (uint256) {
        return purchases[token][buyer];
    }
}

