import { Asset, Portfolio, Transaction, Income, Notification, User } from '../types';

export const mockUser: User = {
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  kycStatus: 'verified',
  network: 'Sepolia',
  email: 'user@example.com',
};

export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Brooklyn Heights Residential',
    location: 'Brooklyn, NY, USA',
    type: 'real-estate',
    verified: true,
    pricePerToken: 1250.00,
    availableSupply: 450,
    totalSupply: 1000,
    tokenSymbol: 'BHR',
    decimals: 18,
    documentHash: 'QmX7Y8Z9A1B2C3D4E5F6G7H8I9J0K',
    oracleStatus: 'active',
    lastOracleUpdate: '2026-01-06T10:30:00Z',
    liquidityPool: {
      available: true,
      liquidity: 562500,
      priceSource: 'Chainlink + Independent Appraisal',
    },
    monthlyRate: 0.42,
  },
  {
    id: '2',
    name: 'Miami Art District Commercial',
    location: 'Miami, FL, USA',
    type: 'real-estate',
    verified: true,
    pricePerToken: 2100.00,
    availableSupply: 320,
    totalSupply: 800,
    tokenSymbol: 'MADC',
    decimals: 18,
    documentHash: 'QmA1B2C3D4E5F6G7H8I9J0K1L',
    oracleStatus: 'active',
    lastOracleUpdate: '2026-01-06T09:15:00Z',
    liquidityPool: {
      available: true,
      liquidity: 672000,
      priceSource: 'Chainlink + Independent Appraisal',
    },
    monthlyRate: 0.38,
  },
  {
    id: '3',
    name: 'Austin Tech Campus',
    location: 'Austin, TX, USA',
    type: 'real-estate',
    verified: true,
    pricePerToken: 3500.00,
    availableSupply: 0,
    totalSupply: 500,
    tokenSymbol: 'ATC',
    decimals: 18,
    documentHash: 'QmB2C3D4E5F6G7H8I9J0K1L2M',
    oracleStatus: 'active',
    lastOracleUpdate: '2026-01-06T08:45:00Z',
    liquidityPool: {
      available: true,
      liquidity: 1750000,
      priceSource: 'Chainlink + Independent Appraisal',
    },
    monthlyRate: 0.35,
  },
];

export const mockPortfolio: Portfolio[] = [
  {
    assetId: '1',
    assetName: 'Brooklyn Heights Residential',
    tokensOwned: 25,
    value: 31250.00,
    status: 'active',
  },
  {
    assetId: '2',
    assetName: 'Miami Art District Commercial',
    tokensOwned: 15,
    value: 31500.00,
    status: 'active',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    assetName: 'Brooklyn Heights Residential',
    date: '2026-01-05T14:30:00Z',
    amount: 25000.00,
    fee: 125.00,
    status: 'success',
    txHash: '0xabc123def456...',
  },
  {
    id: '2',
    type: 'claim',
    assetName: 'Miami Art District Commercial',
    date: '2026-01-03T10:15:00Z',
    amount: 119.70,
    fee: 2.50,
    status: 'success',
    txHash: '0xdef456abc789...',
  },
  {
    id: '3',
    type: 'buy',
    assetName: 'Austin Tech Campus',
    date: '2026-01-02T16:45:00Z',
    amount: 10500.00,
    fee: 52.50,
    status: 'failed',
    reason: 'Oracle verification failed - price data stale',
  },
];

export const mockIncome: Income[] = [
  {
    assetId: '1',
    assetName: 'Brooklyn Heights Residential',
    tokensOwned: 25,
    monthlyRate: 0.42,
    claimable: 131.25,
    claimed: 393.75,
  },
  {
    assetId: '2',
    assetName: 'Miami Art District Commercial',
    tokensOwned: 15,
    monthlyRate: 0.38,
    claimable: 119.70,
    claimed: 239.40,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'income',
    message: 'Income distribution available for Brooklyn Heights Residential',
    timestamp: '2026-01-06T08:00:00Z',
    read: false,
    actionUrl: '/income',
  },
  {
    id: '2',
    type: 'purchase',
    message: 'Purchase successful: 25 BHR tokens',
    timestamp: '2026-01-05T14:30:00Z',
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    message: 'Transaction failed: Oracle verification failed',
    timestamp: '2026-01-02T16:45:00Z',
    read: true,
  },
];
