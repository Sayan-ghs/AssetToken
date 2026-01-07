/**
 * TYPE DEFINITIONS
 * Comprehensive TypeScript types for the entire application
 */

// ============================================================================
// WALLET TYPES
// ============================================================================

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
  chainId: number | null;
  provider: any;
  signer: any;
}

export interface WalletError {
  code: string;
  message: string;
}

// ============================================================================
// ASSET TYPES
// ============================================================================

export interface Asset {
  id: string;
  token: string;
  owner: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  metadataURI: string;
  active: boolean;
  priceUSD: string;
  marketCap: string;
  volume24h: string;
  change24h: string;
  imageUrl?: string;
  description?: string;
}

export interface AssetDetails extends Asset {
  holders: number;
  transactions: number;
  liquidity: string;
  poolAddress?: string;
  reserveToken?: string;
  reserveETH?: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export type TransactionType = 
  | 'transfer'
  | 'approve'
  | 'buy'
  | 'sell'
  | 'swap'
  | 'addLiquidity'
  | 'removeLiquidity'
  | 'stake'
  | 'unstake'
  | 'claim';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  tokenSymbol?: string;
  tokenAmount?: string;
}

export interface PendingTransaction extends Transaction {
  status: 'pending';
  nonce: number;
  retryCount: number;
}

// ============================================================================
// AMM POOL TYPES
// ============================================================================

export interface PoolReserves {
  reserveToken: string;
  reserveETH: string;
  totalSupply: string;
  userLiquidity: string;
  shareOfPool: string;
}

export interface PoolPrice {
  tokenPriceInETH: string;
  ethPriceInToken: string;
  priceImpact: string;
}

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  minimumReceived: string;
  fee: string;
  route: string[];
}

export interface LiquidityPosition {
  lpTokenBalance: string;
  tokenAmount: string;
  ethAmount: string;
  shareOfPool: string;
  value: string;
}

// ============================================================================
// SALE TYPES
// ============================================================================

export interface Sale {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  pricePerToken: string;
  totalSupply: string;
  remainingSupply: string;
  startTime: number;
  endTime: number;
  active: boolean;
  raised: string;
  participants: number;
}

export interface SaleDetails extends Sale {
  minPurchase: string;
  maxPurchase: string;
  vestingPeriod?: number;
  description?: string;
  imageUrl?: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserProfile {
  address: string;
  joinedDate: number;
  totalAssets: number;
  totalValue: string;
  totalTransactions: number;
}

export interface UserPortfolio {
  assets: Asset[];
  totalValue: string;
  change24h: string;
  liquidity: LiquidityPosition[];
}

// ============================================================================
// ORACLE TYPES
// ============================================================================

export interface PriceData {
  asset: string;
  price: string;
  timestamp: number;
  confidence: number;
}

// ============================================================================
// RESERVE TYPES
// ============================================================================

export interface ReserveData {
  amount: string;
  timestamp: number;
  proofHash: string;
  verified: boolean;
}

// ============================================================================
// FEE TYPES
// ============================================================================

export interface FeeData {
  feePercent: string;
  collectedFees: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// ============================================================================
// CONTRACT CALL TYPES
// ============================================================================

export interface ContractCallParams {
  method: string;
  args: any[];
  value?: string;
  gasLimit?: number;
}

export interface ContractCallResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionHash?: string;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Splash: undefined;
  WalletConnect: undefined;
  Main: undefined;
  AssetDetails: { assetId: string };
  SwapConfirm: { quote: SwapQuote };
  TransactionDetails: { txHash: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Assets: undefined;
  Swap: undefined;
  Liquidity: undefined;
  Profile: undefined;
};

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseWalletReturn {
  address: string | null;
  isConnected: boolean;
  balance: string;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

export interface UseContractReturn {
  read: (method: string, args?: any[]) => Promise<any>;
  write: (method: string, args?: any[], value?: string) => Promise<string>;
  getBalance: (address: string) => Promise<string>;
  approve: (spender: string, amount: string) => Promise<string>;
}

export interface UseApiReturn {
  get: <T = any>(endpoint: string, params?: any) => Promise<ApiResponse<T>>;
  post: <T = any>(endpoint: string, data?: any) => Promise<ApiResponse<T>>;
  put: <T = any>(endpoint: string, data?: any) => Promise<ApiResponse<T>>;
  delete: <T = any>(endpoint: string) => Promise<ApiResponse<T>>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface TransferFormData {
  to: string;
  amount: string;
}

export interface SwapFormData {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
}

export interface AddLiquidityFormData {
  tokenAmount: string;
  ethAmount: string;
  slippage: number;
}

export interface RemoveLiquidityFormData {
  lpTokenAmount: string;
  slippage: number;
}

// ============================================================================
// STORE TYPES
// ============================================================================

export interface WalletStore {
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reset: () => void;
}

export interface AppStore {
  isLoading: boolean;
  error: string | null;
  lastSync: number;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSync: (timestamp: number) => void;
  reset: () => void;
}

export interface ContractStore {
  assets: Asset[];
  transactions: Transaction[];
  poolReserves: PoolReserves | null;
  setAssets: (assets: Asset[]) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
  setPoolReserves: (reserves: PoolReserves) => void;
  reset: () => void;
}
