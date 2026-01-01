// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PlatformFeeController is Ownable {
    uint256 public primarySaleFeeBPS = 100; // 1% default
    uint256 public ammSwapFeeBPS = 50; // 0.5% default
    uint256 public liquidityFeeBPS = 25; // 0.25% default
    uint256 public constant MAX_FEE_BPS = 1000; // 10% maximum

    address public feeRecipient;
    uint256 public accumulatedETH;
    mapping(address => uint256) public accumulatedTokens;

    mapping(address => bool) public feeExempt;

    error InvalidFeeRecipient();
    error FeeExceedsMaximum();
    error NoFeesAccumulated();
    error TransferFailed();
    error InvalidToken();

    event PrimarySaleFeeSet(uint256 oldFee, uint256 newFee);
    event AMMSwapFeeSet(uint256 oldFee, uint256 newFee);
    event LiquidityFeeSet(uint256 oldFee, uint256 newFee);
    event FeeRecipientSet(address indexed oldRecipient, address indexed newRecipient);
    event FeeExemptUpdated(address indexed account, bool exempt);
    event FeeAccumulated(address indexed token, uint256 amount, bool isETH);
    event FeesWithdrawn(address indexed token, address indexed recipient, uint256 amount, bool isETH);

    constructor(address feeRecipient_) Ownable(msg.sender) {
        if (feeRecipient_ == address(0)) {
            revert InvalidFeeRecipient();
        }
        feeRecipient = feeRecipient_;
    }

    function setPrimarySaleFee(uint256 feeBPS) external onlyOwner {
        if (feeBPS > MAX_FEE_BPS) {
            revert FeeExceedsMaximum();
        }
        uint256 oldFee = primarySaleFeeBPS;
        primarySaleFeeBPS = feeBPS;
        emit PrimarySaleFeeSet(oldFee, feeBPS);
    }

    function setAMMSwapFee(uint256 feeBPS) external onlyOwner {
        if (feeBPS > MAX_FEE_BPS) {
            revert FeeExceedsMaximum();
        }
        uint256 oldFee = ammSwapFeeBPS;
        ammSwapFeeBPS = feeBPS;
        emit AMMSwapFeeSet(oldFee, feeBPS);
    }

    function setLiquidityFee(uint256 feeBPS) external onlyOwner {
        if (feeBPS > MAX_FEE_BPS) {
            revert FeeExceedsMaximum();
        }
        uint256 oldFee = liquidityFeeBPS;
        liquidityFeeBPS = feeBPS;
        emit LiquidityFeeSet(oldFee, feeBPS);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) {
            revert InvalidFeeRecipient();
        }
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientSet(oldRecipient, newRecipient);
    }

    function setFeeExempt(address account, bool exempt) external onlyOwner {
        feeExempt[account] = exempt;
        emit FeeExemptUpdated(account, exempt);
    }

    function calculatePrimarySaleFee(uint256 amount) external view returns (uint256) {
        if (feeExempt[msg.sender]) {
            return 0;
        }
        return (amount * primarySaleFeeBPS) / 10000;
    }

    function calculateAMMSwapFee(uint256 amount) external view returns (uint256) {
        if (feeExempt[msg.sender]) {
            return 0;
        }
        return (amount * ammSwapFeeBPS) / 10000;
    }

    function calculateLiquidityFee(uint256 amount) external view returns (uint256) {
        if (feeExempt[msg.sender]) {
            return 0;
        }
        return (amount * liquidityFeeBPS) / 10000;
    }

    function accumulateFeeETH() external payable {
        if (msg.value == 0) {
            revert NoFeesAccumulated();
        }
        accumulatedETH += msg.value;
        emit FeeAccumulated(address(0), msg.value, true);
    }

    function accumulateFeeToken(address token, uint256 amount) external {
        if (token == address(0)) {
            revert InvalidToken();
        }
        if (amount == 0) {
            revert NoFeesAccumulated();
        }

        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TransferFailed();
        }

        accumulatedTokens[token] += amount;
        emit FeeAccumulated(token, amount, false);
    }

    function withdrawETHFees() external onlyOwner {
        uint256 amount = accumulatedETH;
        if (amount == 0) {
            revert NoFeesAccumulated();
        }

        accumulatedETH = 0;

        (bool success,) = payable(feeRecipient).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }

        emit FeesWithdrawn(address(0), feeRecipient, amount, true);
    }

    function withdrawTokenFees(address token) external onlyOwner {
        if (token == address(0)) {
            revert InvalidToken();
        }

        uint256 amount = accumulatedTokens[token];
        if (amount == 0) {
            revert NoFeesAccumulated();
        }

        accumulatedTokens[token] = 0;

        bool success = IERC20(token).transfer(feeRecipient, amount);
        if (!success) {
            revert TransferFailed();
        }

        emit FeesWithdrawn(token, feeRecipient, amount, false);
    }

    function getAccumulatedETH() external view returns (uint256) {
        return accumulatedETH;
    }

    function getAccumulatedToken(address token) external view returns (uint256) {
        return accumulatedTokens[token];
    }
}

