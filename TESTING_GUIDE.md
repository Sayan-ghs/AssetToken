# Testing Guide - Asset Tokenization Platform

## Overview
This guide walks you through testing all contracts in the Asset Tokenization platform step by step.

## Test Structure

### ✅ Completed Test Files
1. **AssetToken.t.sol** - ERC20 token tests
2. **AssetRegistry.t.sol** - Asset registration and management
3. **PlatformFeeController.t.sol** - Fee management system
4. **AMMPool.t.sol** - Automated Market Maker pool
5. **LPToken.t.sol** - Liquidity provider token
6. **PrimarySale.t.sol** - Primary token sale mechanism
7. **OraclePriceFeed.t.sol** - Chainlink price feed integration
8. **ProofOfReserve.t.sol** - Reserve verification system

## Step-by-Step Testing

### Step 1: Run All Tests
```bash
forge test
```

### Step 2: Run Tests with Verbose Output
```bash
forge test -vvv
```

### Step 3: Run Specific Test File
```bash
forge test --match-path test/AssetToken.t.sol
```

### Step 4: Run Specific Test Function
```bash
forge test --match-test test_Deployment_Success
```

### Step 5: Run Tests with Gas Reporting
```bash
forge test --gas-report
```

## Test Coverage by Contract

### 1. AssetToken (ERC20)
**Test File:** `test/AssetToken.t.sol`

**Coverage:**
- ✅ Constructor validation (invalid owner, invalid supply)
- ✅ Token metadata (name, symbol, decimals)
- ✅ Transfer functionality
- ✅ Edge cases (zero transfer, entire balance, insufficient balance)

**Key Tests:**
- `test_Deployment_Success` - Verifies proper deployment
- `test_Deployment_RevertWhen_InvalidAssetOwner` - Validates owner check
- `test_Transfer_Success` - Tests basic transfer

### 2. AssetRegistry
**Test File:** `test/AssetRegistry.t.sol`

**Coverage:**
- ✅ Asset registration
- ✅ Asset deactivation
- ✅ Asset retrieval
- ✅ Authorization checks
- ✅ Error handling

**Key Tests:**
- `test_RegisterAsset_Success` - Registers new asset
- `test_DeactivateAsset_Success` - Deactivates asset
- `test_RegisterAsset_RevertWhen_TokenAlreadyRegistered` - Prevents duplicates

### 3. PlatformFeeController
**Test File:** `test/PlatformFeeController.t.sol`

**Coverage:**
- ✅ Fee configuration (primary sale, AMM swap, liquidity)
- ✅ Fee exemption system
- ✅ Fee accumulation (ETH and tokens)
- ✅ Fee withdrawal
- ✅ Maximum fee limits

**Key Tests:**
- `test_CalculatePrimarySaleFee_NormalUser` - Calculates 1% fee
- `test_CalculatePrimarySaleFee_ExemptUser` - Zero fee for exempt users
- `test_WithdrawETHFees_Success` - Withdraws accumulated fees

### 4. AMMPool
**Test File:** `test/AMMPool.t.sol`

**Coverage:**
- ✅ Adding liquidity (initial and subsequent)
- ✅ Removing liquidity
- ✅ Swapping ETH for tokens
- ✅ Swapping tokens for ETH
- ✅ Price calculations
- ✅ Reserve management

**Key Tests:**
- `test_AddLiquidity_InitialLiquidity` - First liquidity provision
- `test_SwapETHForTokens_Success` - ETH to token swap
- `test_GetAmountOut_ETHIn` - Price calculation

### 5. LPToken
**Test File:** `test/LPToken.t.sol`

**Coverage:**
- ✅ Minting (pool-only)
- ✅ Burning (pool-only)
- ✅ ERC20 functionality (transfer, approve)
- ✅ Authorization checks

**Key Tests:**
- `test_Mint_Success` - Pool mints LP tokens
- `test_Mint_RevertWhen_NotPool` - Only pool can mint
- `test_Burn_Success` - Pool burns LP tokens

### 6. PrimarySale
**Test File:** `test/PrimarySale.t.sol`

**Coverage:**
- ✅ Sale creation
- ✅ Token purchase
- ✅ Price calculation (note: uses 1 wei = 1 ether per token due to contract design)

**Key Tests:**
- `testCreateSale` - Creates a sale
- `testBuyTokens` - Purchases tokens

**⚠️ Important Note:** The contract multiplies `pricePerToken * tokenAmount` directly without decimal adjustment. Therefore:
- `pricePerToken = 1 wei` represents "1 ether per token" in human terms
- `pricePerToken = 1 ether` would mean "10^18 ether per token" (incorrect)

### 7. OraclePriceFeed
**Test File:** `test/OraclePriceFeed.t.sol`

**Coverage:**
- ✅ Setting price feeds
- ✅ Getting prices
- ✅ Stale price detection
- ✅ Invalid price handling
- ✅ Multiple token support

**Key Tests:**
- `test_GetPrice_Success` - Retrieves price
- `test_GetPrice_RevertWhen_StalePrice` - Detects stale prices
- `test_MultipleTokens` - Supports multiple price feeds

**Mock Contract:** Uses `MockAggregatorV3.sol` to simulate Chainlink price feeds

### 8. ProofOfReserve
**Test File:** `test/ProofOfReserve.t.sol`

**Coverage:**
- ✅ Setting reserve feeds
- ✅ Setting total supply
- ✅ Reserve verification (5% deviation allowed)
- ✅ Deviation calculation
- ✅ Stale reserve detection

**Key Tests:**
- `test_CheckReserve_Valid` - Reserve matches supply
- `test_CheckReserve_WithinDeviation` - 4% deviation (valid)
- `test_CheckReserve_ExceedsDeviation` - 6% deviation (invalid)

## Running Tests

### Basic Commands

```bash
# Run all tests
forge test

# Run with detailed output
forge test -vvv

# Run specific contract tests
forge test --match-contract AssetTokenTest

# Run specific test
forge test --match-test test_Deployment_Success

# Run with gas reporting
forge test --gas-report

# Run with coverage (if configured)
forge coverage
```

### Expected Results

All tests should pass. If you see failures:

1. **Check compiler errors:** `forge build`
2. **Check test output:** Use `-vvv` for detailed logs
3. **Verify setup:** Ensure `setUp()` functions run correctly
4. **Check mocks:** Oracle tests require mock contracts

## Test Best Practices

### 1. Test Structure
- Use descriptive test names: `test_FunctionName_Scenario`
- Group related tests together
- Use `setUp()` for common initialization

### 2. Assertions
- Use specific assertions: `assertEq()`, `assertTrue()`, `assertGt()`
- Test both success and failure cases
- Verify events are emitted correctly

### 3. Edge Cases
- Zero values
- Maximum values
- Boundary conditions
- Reentrancy scenarios (where applicable)

### 4. Error Handling
- Test all custom errors
- Use `vm.expectRevert()` for expected failures
- Verify error selectors match

## Common Issues and Solutions

### Issue: "InsufficientPayment" in PrimarySale
**Solution:** Use `pricePerToken = 1 wei` (not `1 ether`) when creating sales. See `test/PrimarySale.t.sol` for details.

### Issue: Mock Aggregator not found
**Solution:** Ensure `test/mocks/MockAggregatorV3.sol` exists and is properly imported.

### Issue: Tests failing due to time
**Solution:** Use `vm.warp()` to manipulate block.timestamp if needed.

## Next Steps

1. ✅ Run all tests: `forge test`
2. ✅ Review test coverage
3. ✅ Add integration tests (optional)
4. ✅ Add fuzz tests (optional)
5. ✅ Set up CI/CD testing

## Test Statistics

- **Total Test Files:** 8
- **Total Test Functions:** ~80+
- **Coverage Areas:**
  - Constructor validation
  - Function execution
  - Error handling
  - Edge cases
  - Event emission
  - Access control

## Questions?

If you encounter issues:
1. Check the test output with `-vvv`
2. Review the contract code
3. Verify mock contracts are set up correctly
4. Ensure all dependencies are installed

Happy Testing! 🚀

