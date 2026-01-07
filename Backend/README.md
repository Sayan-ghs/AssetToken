# AssetToken Backend API

A Node.js/Express backend service for interacting with AssetToken smart contracts on the blockchain. This API provides endpoints for token management, primary sales, AMM operations, proof of reserve, fee management, and oracle price feeds.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
  - [Token Routes](#token-routes)
  - [Sale Routes](#sale-routes)
  - [AMM Routes](#amm-routes)
  - [Reserve Routes](#reserve-routes)
  - [Fee Routes](#fee-routes)
  - [Oracle Routes](#oracle-routes)
- [Services](#services)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

## 🏗️ Architecture

```
Backend/
├── src/
│   ├── blockchain/
│   │   ├── abi/              # Smart contract ABIs
│   │   └── contracts.js      # Contract factory functions
│   ├── config/
│   │   ├── env.js            # Environment configuration
│   │   └── provider.js       # Ethers.js provider setup
│   ├── routes/               # API route handlers
│   │   ├── token.routes.js
│   │   ├── sale.routes.js
│   │   ├── amm.routes.js
│   │   ├── reserve.routes.js
│   │   ├── fee.routes.js
│   │   └── oracle.routes.js
│   ├── service/              # Business logic layer
│   │   ├── token.service.js
│   │   ├── sale.service.js
│   │   ├── amm.service.js
│   │   ├── reserve.service.js
│   │   ├── fee.service.js
│   │   └── oracle.service.js
│   ├── app.js                # Express app configuration
│   └── index.js              # Server entry point
├── .env                      # Environment variables
└── package.json
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.x
- **Blockchain**: Ethers.js v6.x
- **CORS**: Enabled for cross-origin requests
- **Environment**: dotenv for configuration

## 🚀 Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to an Ethereum RPC endpoint

### Installation

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory:
```bash
cp .env.example .env
```

4. Configure environment variables (see [Environment Variables](#environment-variables))

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Blockchain Configuration
RPC_URL=https://your-rpc-endpoint.com
PRIVATE_KEY=your_private_key_here  # Optional, for write operations
```

## 📡 API Routes

### Token Routes

Base path: `/token`

#### Get Token Information

Get comprehensive token information including name, symbol, total supply, and user balance.

**Endpoint**: `GET /token/:token/:user`

**Parameters**:
- `token` (path) - Token contract address
- `user` (path) - User wallet address

**Response**:
```json
{
  "name": "Asset Token",
  "symbol": "AST",
  "supply": "1000000000000000000000000",
  "balance": "500000000000000000000"
}
```

**Example**:
```bash
curl http://localhost:3000/token/0x123.../0xabc...
```

---

### Sale Routes

Base path: `/sale`

#### Get Sale Details

Retrieve details of a primary sale for a specific token.

**Endpoint**: `GET /sale/:saleAddress/:tokenAddress`

**Parameters**:
- `saleAddress` (path) - PrimarySale contract address
- `tokenAddress` (path) - Token contract address

**Response**:
```json
{
  "seller": "0x...",
  "pricePerToken": "1000000000000000000",
  "tokensForSale": "1000000000000000000000",
  "tokensSold": "500000000000000000000",
  "startTime": 1704355200,
  "endTime": 1704441600,
  "isActive": true
}
```

**Example**:
```bash
curl http://localhost:3000/sale/0x123.../0xabc...
```

#### Calculate Sale Cost

Calculate the total cost for purchasing a specific amount of tokens.

**Endpoint**: `POST /sale/calculate-cost`

**Request Body**:
```json
{
  "pricePerToken": "1000000000000000000",
  "amount": "100"
}
```

**Response**:
```json
{
  "pricePerToken": "1000000000000000000",
  "amount": "100",
  "totalCost": "100000000000000000000"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/sale/calculate-cost \
  -H "Content-Type: application/json" \
  -d '{"pricePerToken": "1000000000000000000", "amount": "100"}'
```

---

### AMM Routes

Base path: `/amm`

#### Get Pool State

Get the current state of an AMM pool including reserves and total liquidity.

**Endpoint**: `GET /amm/pool/:poolAddress`

**Parameters**:
- `poolAddress` (path) - AMMPool contract address

**Response**:
```json
{
  "reserveA": "1000000000000000000000",
  "reserveB": "500000000000000000000",
  "totalLiquidity": "707106781186547524"
}
```

**Example**:
```bash
curl http://localhost:3000/amm/pool/0x123...
```

#### Simulate Swap

Simulate a token swap to calculate expected output amount.

**Endpoint**: `POST /amm/simulate-swap`

**Request Body**:
```json
{
  "amountIn": "1000000000000000000",
  "reserveIn": "1000000000000000000000",
  "reserveOut": "500000000000000000000",
  "feeBps": 30
}
```

**Parameters**:
- `amountIn` - Amount of input tokens
- `reserveIn` - Input token reserve
- `reserveOut` - Output token reserve
- `feeBps` - Fee in basis points (30 = 0.3%)

**Response**:
```json
{
  "amountIn": "1000000000000000000",
  "reserveIn": "1000000000000000000000",
  "reserveOut": "500000000000000000000",
  "feeBps": 30,
  "amountOut": "498501497005988023"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/amm/simulate-swap \
  -H "Content-Type: application/json" \
  -d '{
    "amountIn": "1000000000000000000",
    "reserveIn": "1000000000000000000000",
    "reserveOut": "500000000000000000000",
    "feeBps": 30
  }'
```

---

### Reserve Routes

Base path: `/reserve`

#### Verify Proof of Reserve

Verify that a token has valid proof of reserve backing.

**Endpoint**: `GET /reserve/verify/:contractAddress/:token`

**Parameters**:
- `contractAddress` (path) - ProofOfReserve contract address
- `token` (path) - Token contract address to verify

**Response**:
```json
{
  "token": "0x...",
  "isValid": true
}
```

**Example**:
```bash
curl http://localhost:3000/reserve/verify/0x123.../0xabc...
```

---

### Fee Routes

Base path: `/fee`

#### Get Fee Configuration

Get the current fee configuration from the fee controller.

**Endpoint**: `GET /fee/config/:controllerAddress`

**Parameters**:
- `controllerAddress` (path) - FeeController contract address

**Response**:
```json
{
  "primarySaleFee": "100",
  "ammSwapFee": "30",
  "liquidityFee": "10",
  "feeRecipient": "0x..."
}
```

**Note**: Fee values are in basis points (100 = 1%, 30 = 0.3%)

**Example**:
```bash
curl http://localhost:3000/fee/config/0x123...
```

#### Calculate Fee

Calculate the fee amount for a given transaction.

**Endpoint**: `POST /fee/calculate`

**Request Body**:
```json
{
  "amount": "1000000000000000000",
  "feeBps": 30
}
```

**Response**:
```json
{
  "amount": "1000000000000000000",
  "feeBps": 30,
  "fee": "3000000000000000"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/fee/calculate \
  -H "Content-Type: application/json" \
  -d '{"amount": "1000000000000000000", "feeBps": 30}'
```

---

### Oracle Routes

Base path: `/oracle`

#### Get Oracle Price

Get the latest price from an oracle.

**Endpoint**: `GET /oracle/:oracleAddress/price`

**Parameters**:
- `oracleAddress` (path) - Oracle contract address

**Response**:
```json
{
  "price": "250000000000",
  "timestamp": 1704355200000
}
```

**Example**:
```bash
curl http://localhost:3000/oracle/0x123.../price
```

#### Get Oracle Data

Get comprehensive oracle data including price, decimals, and description.

**Endpoint**: `GET /oracle/:oracleAddress/data`

**Parameters**:
- `oracleAddress` (path) - Oracle contract address

**Response**:
```json
{
  "price": "250000000000",
  "decimals": 8,
  "description": "ETH / USD",
  "timestamp": 1704355200000
}
```

**Example**:
```bash
curl http://localhost:3000/oracle/0x123.../data
```

---

## 🔧 Services

The service layer contains the business logic for interacting with smart contracts.

### Token Service

**File**: `src/service/token.service.js`

**Functions**:
- `getTokenInfo(tokenAddress, user)` - Get token information and user balance
- `getBalance(tokenAddress, user)` - Get user balance for a specific token

### Sale Service

**File**: `src/service/sale.service.js`

**Functions**:
- `getSaleDetails(saleAddress, tokenAddress)` - Get primary sale details
- `calculateSaleCost(pricePerToken, amount)` - Calculate total purchase cost

### AMM Service

**File**: `src/service/amm.service.js`

**Functions**:
- `getPoolState(poolAddress)` - Get AMM pool reserves and liquidity
- `simulateSwap(amountIn, reserveIn, reserveOut, feeBps)` - Simulate swap output using constant product formula

**Swap Formula**:
```
amountOut = (amountIn × (10000 - feeBps) × reserveOut) / ((reserveIn × 10000) + (amountIn × (10000 - feeBps)))
```

### Reserve Service

**File**: `src/service/reserve.service.js`

**Functions**:
- `verifyReserve(contractAddress, token)` - Verify proof of reserve for a token

### Fee Service

**File**: `src/service/fee.service.js`

**Functions**:
- `getFeeConfig(controllerAddress)` - Get fee configuration from controller
- `calculateFee(amount, feeBps)` - Calculate fee amount

**Fee Calculation**:
```
fee = (amount × feeBps) / 10000
```

### Oracle Service

**File**: `src/service/oracle.service.js`

**Functions**:
- `getOraclePrice(oracleAddress)` - Get latest price from oracle
- `getOracleData(oracleAddress)` - Get comprehensive oracle information

---

## ⚠️ Error Handling

All routes implement consistent error handling:

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `500` - Internal Server Error (contract errors, network issues)

### Common Errors

**Missing Parameters** (400):
```json
{
  "error": "pricePerToken and amount are required"
}
```

**Contract Errors** (500):
```json
{
  "error": "contract address required"
}
```

**Network Errors** (500):
```json
{
  "error": "could not detect network"
}
```

---

## 💡 Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Get token info
async function getTokenInfo(tokenAddress, userAddress) {
  const response = await axios.get(
    `${API_BASE}/token/${tokenAddress}/${userAddress}`
  );
  return response.data;
}

// Simulate AMM swap
async function simulateSwap(params) {
  const response = await axios.post(
    `${API_BASE}/amm/simulate-swap`,
    params
  );
  return response.data;
}

// Get sale details
async function getSaleDetails(saleAddress, tokenAddress) {
  const response = await axios.get(
    `${API_BASE}/sale/${saleAddress}/${tokenAddress}`
  );
  return response.data;
}
```

### Python

```python
import requests

API_BASE = 'http://localhost:3000'

# Get token info
def get_token_info(token_address, user_address):
    response = requests.get(
        f'{API_BASE}/token/{token_address}/{user_address}'
    )
    return response.json()

# Simulate swap
def simulate_swap(amount_in, reserve_in, reserve_out, fee_bps):
    response = requests.post(
        f'{API_BASE}/amm/simulate-swap',
        json={
            'amountIn': amount_in,
            'reserveIn': reserve_in,
            'reserveOut': reserve_out,
            'feeBps': fee_bps
        }
    )
    return response.json()
```

### cURL

```bash
# Get token information
curl http://localhost:3000/token/0xTOKEN_ADDRESS/0xUSER_ADDRESS

# Calculate sale cost
curl -X POST http://localhost:3000/sale/calculate-cost \
  -H "Content-Type: application/json" \
  -d '{"pricePerToken": "1000000000000000000", "amount": "100"}'

# Get pool state
curl http://localhost:3000/amm/pool/0xPOOL_ADDRESS

# Verify reserve
curl http://localhost:3000/reserve/verify/0xCONTRACT_ADDRESS/0xTOKEN_ADDRESS

# Get fee config
curl http://localhost:3000/fee/config/0xCONTROLLER_ADDRESS

# Get oracle price
curl http://localhost:3000/oracle/0xORACLE_ADDRESS/price
```

---

## 🧪 Testing

### Manual Testing

Use the provided cURL examples or tools like Postman to test the endpoints.

### Testing Tips

1. **Use testnet addresses** - Test with Sepolia, Goerli, or other testnets first
2. **Validate addresses** - Ensure all addresses are valid Ethereum addresses
3. **Check decimals** - Token amounts should account for token decimals (usually 18)
4. **BigInt handling** - Large numbers are returned as strings to prevent JavaScript precision loss

---

## 🔒 Security Considerations

1. **Private Keys** - Never commit `.env` file or expose private keys
2. **CORS** - Configure CORS appropriately for production
3. **Rate Limiting** - Consider implementing rate limiting for production
4. **Input Validation** - All user inputs are validated before processing
5. **Error Messages** - Sensitive information is not exposed in error messages

---

## 📝 Development Notes

### BigInt Handling

All blockchain numeric values use BigInt for precision:
- Token amounts (18 decimals typically)
- Prices and reserves
- Fee calculations

Values are converted to strings in API responses to prevent JSON serialization issues.

### Contract ABIs

Contract ABIs are stored in `src/blockchain/abi/` and loaded via CommonJS require:
- `AssetToken.json`
- `PrimarySale.json`
- `AMMPool.json`
- `LPToken.json`
- `OraclePriceFeed.json`
- `ProofofReserve.json`
- `PlatformfeeControler.json`

---

## 📚 Additional Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Smart Contract Repository](../README.md) - Main project documentation

---

## 🤝 Contributing

When adding new routes or services:

1. Follow the existing code structure
2. Add proper error handling
3. Update this README with new endpoints
4. Test thoroughly before committing

---

## 📄 License

MIT License - See main project LICENSE file

---

## 🆘 Support

For issues or questions:
- Check the error logs in the console
- Verify environment variables are set correctly
- Ensure RPC endpoint is accessible
- Confirm contract addresses are correct

---

**Built with ❤️ for AssetToken Project**
