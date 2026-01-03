// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract AMMPool {
    address public token;
    uint256 public reserveToken;
    uint256 public reserveETH;
    uint256 public totalSupply;
    uint256 public constant FEE_BPS = 30; // 0.3% fee (30 basis points)

    mapping(address => uint256) public balanceOf;

    error InvalidToken();
    error InsufficientLiquidity();
    error InsufficientAmount();
    error InsufficientLiquidityBurned();
    error TransferFailed();
    error InsufficientOutput();
    error KInvariantViolation();
    error InvalidAmounts();

    event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 liquidityMinted);

    event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 liquidityBurned);

    event Swap(address indexed sender, address indexed tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address token_) {
        if (token_ == address(0)) {
            revert InvalidToken();
        }
        token = token_;
    }

    function addLiquidity(uint256 tokenAmount, uint256 minTokenAmount, uint256 minETHAmount) external payable {
        if (tokenAmount == 0 || msg.value == 0) {
            revert InvalidAmounts();
        }

        IERC20 tokenContract = IERC20(token);
        uint256 liquidity;
        uint256 actualTokenAmount = tokenAmount;
        uint256 actualETHAmount = msg.value;

        if (totalSupply == 0) {
            liquidity = _sqrt(tokenAmount * msg.value);
            if (liquidity == 0) {
                revert InsufficientLiquidity();
            }
        } else {
            uint256 liquidityToken = (tokenAmount * totalSupply) / reserveToken;
            uint256 liquidityETH = (msg.value * totalSupply) / reserveETH;
            liquidity = liquidityToken < liquidityETH ? liquidityToken : liquidityETH;

            if (liquidity == 0) {
                revert InsufficientLiquidity();
            }

            actualTokenAmount = (liquidity * reserveToken) / totalSupply;
            actualETHAmount = (liquidity * reserveETH) / totalSupply;

            if (actualTokenAmount < minTokenAmount || actualETHAmount < minETHAmount) {
                revert InsufficientAmount();
            }
        }

        bool success = tokenContract.transferFrom(msg.sender, address(this), actualTokenAmount);
        if (!success) {
            revert TransferFailed();
        }

        reserveToken += actualTokenAmount;
        reserveETH += actualETHAmount;

        if (msg.value > actualETHAmount) {
            (bool refundSuccess,) = payable(msg.sender).call{value: msg.value - actualETHAmount}("");
            if (!refundSuccess) {
                revert TransferFailed();
            }
        }
        totalSupply += liquidity;
        balanceOf[msg.sender] += liquidity;

        emit LiquidityAdded(msg.sender, actualTokenAmount, actualETHAmount, liquidity);
    }

    function removeLiquidity(uint256 liquidity, uint256 minTokenAmount, uint256 minETHAmount) external {
        if (liquidity == 0) {
            revert InvalidAmounts();
        }
        if (balanceOf[msg.sender] < liquidity) {
            revert InsufficientLiquidityBurned();
        }

        uint256 tokenAmount = (liquidity * reserveToken) / totalSupply;
        uint256 ethAmount = (liquidity * reserveETH) / totalSupply;

        if (tokenAmount < minTokenAmount || ethAmount < minETHAmount) {
            revert InsufficientAmount();
        }

        balanceOf[msg.sender] -= liquidity;
        totalSupply -= liquidity;
        reserveToken -= tokenAmount;
        reserveETH -= ethAmount;

        bool success = IERC20(token).transfer(msg.sender, tokenAmount);
        if (!success) {
            revert TransferFailed();
        }

        (bool ethSuccess,) = payable(msg.sender).call{value: ethAmount}("");
        if (!ethSuccess) {
            revert TransferFailed();
        }

        emit LiquidityRemoved(msg.sender, tokenAmount, ethAmount, liquidity);
    }

    function swapETHForTokens(uint256 minTokensOut) external payable {
        if (msg.value == 0) {
            revert InvalidAmounts();
        }
        if (reserveToken == 0 || reserveETH == 0) {
            revert InsufficientLiquidity();
        }

        // amountOut = (amountInWithFee * reserveToken) / (reserveETH * 10000 + amountInWithFee)
        uint256 amountInWithFee = msg.value * (10000 - FEE_BPS);
        uint256 denominator = (reserveETH * 10000) + amountInWithFee;
        uint256 amountOut = Math.mulDiv(amountInWithFee, reserveToken, denominator);

        if (amountOut < minTokensOut) {
            revert InsufficientOutput();
        }

        reserveETH += msg.value;
        reserveToken -= amountOut;

        bool success = IERC20(token).transfer(msg.sender, amountOut);
        if (!success) {
            revert TransferFailed();
        }

        emit Swap(msg.sender, address(0), msg.value, amountOut);
    }

    function swapTokensForETH(uint256 tokenAmountIn, uint256 minETHOut) external {
        if (tokenAmountIn == 0) {
            revert InvalidAmounts();
        }
        if (reserveToken == 0 || reserveETH == 0) {
            revert InsufficientLiquidity();
        }

        bool transferSuccess = IERC20(token).transferFrom(msg.sender, address(this), tokenAmountIn);
        if (!transferSuccess) {
            revert TransferFailed();
        }

        // amountOut = (amountInWithFee * reserveETH) / (reserveToken * 10000 + amountInWithFee)
        uint256 amountInWithFee = tokenAmountIn * (10000 - FEE_BPS);
        uint256 denominator = (reserveToken * 10000) + amountInWithFee;
        uint256 amountOut = Math.mulDiv(amountInWithFee, reserveETH, denominator);

        if (amountOut < minETHOut) {
            revert InsufficientOutput();
        }

        reserveToken += tokenAmountIn;
        reserveETH -= amountOut;

        (bool success,) = payable(msg.sender).call{value: amountOut}("");
        if (!success) {
            revert TransferFailed();
        }

        emit Swap(msg.sender, token, tokenAmountIn, amountOut);
    }

    function getAmountOut(uint256 amountIn, bool ethIn) external view returns (uint256) {
        if (reserveToken == 0 || reserveETH == 0) {
            return 0;
        }

        uint256 amountInWithFee = amountIn * (10000 - FEE_BPS);
        if (ethIn) {
            uint256 denominator = (reserveETH * 10000) + amountInWithFee;
            return Math.mulDiv(amountInWithFee, reserveToken, denominator);
        } else {
            uint256 denominator = (reserveToken * 10000) + amountInWithFee;
            return Math.mulDiv(amountInWithFee, reserveETH, denominator);
        }
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveToken, reserveETH);
    }

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
