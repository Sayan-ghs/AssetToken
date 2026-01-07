# Indexer Setup Instructions

## Prerequisites

Before running the indexer, you need:

1. **PostgreSQL Database** - Install and run PostgreSQL
2. **Deployed Smart Contracts** - Your contracts must be deployed on a blockchain network
3. **RPC Endpoint** - Access to an Ethereum RPC endpoint (Infura, Alchemy, or local node)

## Setup Steps

### 1. Install Dependencies

```bash
cd c:\AssetToken\Backend
npm install
```

This will install all dependencies including `@prisma/client` and `prisma`.

### 2. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and update the following values:

```env
# Your blockchain RPC endpoint
RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID

# Your PostgreSQL database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/assettoken?schema=public"

# Your deployed contract addresses
ASSET_TOKEN_ADDRESS=0xYourAssetTokenAddress
PRIMARY_SALE_ADDRESS=0xYourPrimarySaleAddress
AMM_POOL_ADDRESS=0xYourAMMPoolAddress
```

### 3. Setup Database

Generate Prisma client:

```bash
npx prisma generate
```

Push the schema to your database:

```bash
npx prisma db push
```

This creates the following tables:
- `Transfer` - ERC20 transfer events
- `PrimarySale` - Token purchase events  
- `Swap` - AMM swap events

### 4. Clean Up Old Files (Optional)

Remove the old `Listner/` directory and `db/` directory:

```bash
# Remove old listener directory
Remove-Item -Recurse -Force src\indexer\Listner

# Remove old prisma location
Remove-Item -Force db\prisma.js
Remove-Item src\indexer\event.js  # if exists
```

### 5. Run the Indexer

Start the indexer:

```bash
npm run start:indexer
```

For development with auto-reload:

```bash
npm run dev:indexer
```

## Verifying It Works

You should see output like:

```
Starting blockchain event indexer...
Connected to RPC: https://...
Listening for Transfer events on 0x...
Listening for TokensPurchased events on 0x...
Listening for Swap events on 0x...
✓ All event listeners started successfully
Indexer is now running and listening for blockchain events...
```

When blockchain events occur, you'll see:

```
Indexed Transfer: 0xabc... -> 0xdef..., amount: 1000000000000000000
Indexed TokensPurchased: 0x123... bought 100 tokens
Indexed Swap: 0x456... swapped 1000000 for 500000
```

## Troubleshooting

### Cannot connect to database

- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify database exists: `createdb assettoken`

### Cannot connect to RPC

- Check RPC_URL is valid
- Verify you have API credits (for Infura/Alchemy)
- Try a different RPC endpoint

### Contract address not set

- Ensure all contract addresses are set in `.env`
- Addresses must start with `0x`

### Events not being indexed

- Verify contracts are deployed to the network matching your RPC
- Check that events are actually being emitted on-chain
- Look for error messages in console output

## Database Access

View indexed data using Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can browse:
- Transfer events
- PrimarySale events  
- Swap events

## Running Alongside API Server

You can run both the API server and indexer simultaneously:

**Terminal 1** (API Server):
```bash
npm run dev
```

**Terminal 2** (Indexer):
```bash
npm run dev:indexer
```

## Event Signatures

The indexer listens for these events:

**AssetToken (ERC20)**:
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

**PrimarySale**:
```solidity
event TokensPurchased(
    address indexed token,
    address indexed buyer,
    uint256 amount,
    uint256 totalCost
);
```

**AMMPool**:
```solidity
event Swap(
    address indexed user,
    address tokenIn,
    uint256 amountIn,
    address tokenOut,
    uint256 amountOut
);
```

---

## Next Steps

After successful setup:

1. Deploy your smart contracts (if not already deployed)
2. Update `.env` with real contract addresses
3. Start the indexer
4. Interact with your contracts to see events being indexed
5. Use the data in your frontend application

For API documentation, see [README.md](./README.md)
