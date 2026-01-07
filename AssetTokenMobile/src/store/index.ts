/**
 * ZUSTAND STORES
 * Centralized state management for the application
 */

import { create } from 'zustand';
import {
  WalletState,
  Asset,
  Transaction,
  PoolReserves,
  AppStore,
  WalletStore,
  ContractStore,
} from '../types';
import { walletService } from '../services/wallet';
import { blockchainService } from '../services/blockchain';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';

// ============================================================================
// WALLET STORE
// ============================================================================

const initialWalletState: WalletState = {
  address: null,
  isConnected: false,
  balance: '0',
  chainId: null,
  provider: null,
  signer: null,
};

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallet: initialWalletState,
  
  setWallet: (wallet: Partial<WalletState>) => {
    set((state) => ({
      wallet: { ...state.wallet, ...wallet },
    }));
  },
  
  connect: async () => {
    // This will be called from WalletConnect modal callback
    console.log('✅ Wallet connected via WalletConnect');
  },
  
  disconnect: async () => {
    walletService.reset();
    set({ wallet: initialWalletState });
    console.log('✅ Wallet disconnected');
  },
  
  reset: () => {
    set({ wallet: initialWalletState });
  },
}));

// ============================================================================
// APP STORE
// ============================================================================

export const useAppStore = create<AppStore>((set) => ({
  isLoading: false,
  error: null,
  lastSync: 0,
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setLastSync: (timestamp: number) => {
    set({ lastSync: timestamp });
  },
  
  reset: () => {
    set({
      isLoading: false,
      error: null,
      lastSync: 0,
    });
  },
}));

// ============================================================================
// CONTRACT STORE
// ============================================================================

export const useContractStore = create<ContractStore>((set) => ({
  assets: [],
  transactions: [],
  poolReserves: null,
  
  setAssets: (assets: Asset[]) => {
    set({ assets });
  },
  
  addTransaction: (tx: Transaction) => {
    set((state) => ({
      transactions: [tx, ...state.transactions],
    }));
  },
  
  updateTransaction: (hash: string, updates: Partial<Transaction>) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    }));
  },
  
  setPoolReserves: (reserves: PoolReserves) => {
    set({ poolReserves: reserves });
  },
  
  reset: () => {
    set({
      assets: [],
      transactions: [],
      poolReserves: null,
    });
  },
}));

// ============================================================================
// THEME STORE
// ============================================================================

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,
  
  toggleTheme: () => {
    set((state) => ({ isDark: !state.isDark }));
  },
  
  setTheme: (isDark: boolean) => {
    set({ isDark });
  },
}));

// ============================================================================
// SELECTORS (for better performance)
// ============================================================================

export const selectWalletAddress = (state: { wallet: WalletState }) => state.wallet.address;
export const selectIsConnected = (state: { wallet: WalletState }) => state.wallet.isConnected;
export const selectBalance = (state: { wallet: WalletState }) => state.wallet.balance;
export const selectChainId = (state: { wallet: WalletState }) => state.wallet.chainId;
