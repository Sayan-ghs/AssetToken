/**
 * CONSTANTS - All app-wide configuration values
 * Centralized configuration for easy maintenance and updates
 */

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

export const NETWORK_CONFIG = {
  // Ethereum Sepolia Testnet
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Add more networks as needed
  ETHEREUM_MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

// Default network to use
export const DEFAULT_NETWORK = NETWORK_CONFIG.SEPOLIA;

// ============================================================================
// CONTRACT ADDRESSES
// ============================================================================

export const CONTRACT_ADDRESSES = {
  // Replace these with your deployed contract addresses
  ASSET_TOKEN: '0x0000000000000000000000000000000000000000',
  ASSET_REGISTRY: '0x0000000000000000000000000000000000000000',
  PRIMARY_SALE: '0x0000000000000000000000000000000000000000',
  AMM_POOL: '0x0000000000000000000000000000000000000000',
  ORACLE_PRICE_FEED: '0x0000000000000000000000000000000000000000',
  PROOF_OF_RESERVE: '0x0000000000000000000000000000000000000000',
  PLATFORM_FEE_CONTROLLER: '0x0000000000000000000000000000000000000000',
};

// ============================================================================
// BACKEND API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000', // Change to your backend URL
  TIMEOUT: 30000, // 30 seconds
  ENDPOINTS: {
    // Token endpoints
    TOKEN: {
      INFO: '/api/token/info',
      BALANCE: '/api/token/balance',
      TRANSFER: '/api/token/transfer',
      APPROVE: '/api/token/approve',
    },
    // Sale endpoints
    SALE: {
      LIST: '/api/sale/list',
      CREATE: '/api/sale/create',
      BUY: '/api/sale/buy',
      DETAILS: '/api/sale/details',
    },
    // AMM endpoints
    AMM: {
      RESERVES: '/api/amm/reserves',
      PRICE: '/api/amm/price',
      ADD_LIQUIDITY: '/api/amm/add-liquidity',
      REMOVE_LIQUIDITY: '/api/amm/remove-liquidity',
      SWAP: '/api/amm/swap',
    },
    // Reserve endpoints
    RESERVE: {
      INFO: '/api/reserve/info',
      UPDATE: '/api/reserve/update',
      VERIFY: '/api/reserve/verify',
    },
    // Oracle endpoints
    ORACLE: {
      PRICE: '/api/oracle/price',
      UPDATE: '/api/oracle/update-price',
    },
    // Fee endpoints
    FEE: {
      INFO: '/api/fee/info',
      UPDATE: '/api/fee/update',
    },
    // User endpoints
    USER: {
      PROFILE: '/api/user/profile',
      TRANSACTIONS: '/api/user/transactions',
      ASSETS: '/api/user/assets',
    },
  },
};

// ============================================================================
// WALLETCONNECT CONFIGURATION
// ============================================================================

export const WALLET_CONNECT_CONFIG = {
  PROJECT_ID: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
  METADATA: {
    name: 'AssetToken Mobile',
    description: 'Real-World Asset Tokenization Platform',
    url: 'https://assettokenmobile.app',
    icons: ['https://assettokenmobile.app/icon.png'],
    redirect: {
      native: 'assettokenmobile://',
    },
  },
};

// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  APP_NAME: 'AssetToken',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@assettokenmobile.app',
  TERMS_URL: 'https://assettokenmobile.app/terms',
  PRIVACY_URL: 'https://assettokenmobile.app/privacy',
};

// ============================================================================
// TRANSACTION CONFIGURATION
// ============================================================================

export const TX_CONFIG = {
  DEFAULT_GAS_LIMIT: 300000,
  GAS_PRICE_MULTIPLIER: 1.1, // 10% buffer
  CONFIRMATION_BLOCKS: 2,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 300,
  SKELETON_SHIMMER_DURATION: 1000,
  REFRESH_INTERVAL: 30000, // 30 seconds
  DEBOUNCE_DELAY: 500,
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  THEME_MODE: 'theme_mode',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  CACHED_ASSETS: 'cached_assets',
  CACHED_TRANSACTIONS: 'cached_transactions',
  LAST_SYNC: 'last_sync',
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  MIN_AMOUNT: 0.000001,
  MAX_AMOUNT: 1000000,
  DECIMAL_PLACES: 6,
  ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  TRANSACTION_REJECTED: 'Transaction rejected by user',
  NETWORK_ERROR: 'Network error. Please try again',
  INVALID_ADDRESS: 'Invalid Ethereum address',
  INVALID_AMOUNT: 'Invalid amount',
  CONTRACT_ERROR: 'Smart contract error',
  API_ERROR: 'Backend API error',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUBMITTED: 'Transaction submitted',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
  DATA_REFRESHED: 'Data refreshed successfully',
};

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const LOADING_MESSAGES = {
  CONNECTING_WALLET: 'Connecting wallet...',
  LOADING_DATA: 'Loading data...',
  SUBMITTING_TRANSACTION: 'Submitting transaction...',
  CONFIRMING_TRANSACTION: 'Confirming transaction...',
  SYNCING: 'Syncing...',
};
