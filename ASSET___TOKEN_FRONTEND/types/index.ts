export interface Asset {
  id: string;
  name: string;
  location: string;
  type: 'real-estate' | 'commodity' | 'infrastructure' | 'art';
  verified: boolean;
  pricePerToken: number;
  availableSupply: number;
  totalSupply: number;
  tokenSymbol: string;
  decimals: number;
  imageUrl?: string;
  documentHash: string;
  oracleStatus: 'active' | 'stale' | 'paused';
  lastOracleUpdate: string;
  liquidityPool: {
    available: boolean;
    liquidity: number;
    priceSource: string;
  };
  monthlyRate?: number;
}

export interface Portfolio {
  assetId: string;
  assetName: string;
  tokensOwned: number;
  value: number;
  status: 'active' | 'paused';
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'claim';
  assetName: string;
  date: string;
  amount: number;
  fee: number;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
  reason?: string;
}

export interface Income {
  assetId: string;
  assetName: string;
  tokensOwned: number;
  monthlyRate: number;
  claimable: number;
  claimed: number;
}

export interface Notification {
  id: string;
  type: 'approval' | 'purchase' | 'income' | 'claim' | 'warning';
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface User {
  walletAddress: string;
  kycStatus: 'verified' | 'pending' | 'not-started';
  network: 'Mainnet' | 'Sepolia';
  email?: string;
  phone?: string;
}

export interface AssetSubmission {
  id: string;
  name: string;
  location: string;
  type: string;
  totalSupply: number;
  tokenSymbol: string;
  documents: {
    titleDeed?: File;
    valuationReport?: File;
    legalOpinion?: File;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}
