/**
 * CUSTOM HOOKS
 * Reusable hooks for common functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWalletStore, useAppStore, useContractStore } from '../store';
import { blockchainService } from '../services/blockchain';
import { apiService } from '../services/api';
import { walletService } from '../services/wallet';
import { Asset, Transaction, PoolReserves } from '../types';
import { UI_CONFIG } from '../constants';

// ============================================================================
// useWallet - Main wallet hook
// ============================================================================

export const useWallet = () => {
  const { wallet, setWallet, disconnect } = useWalletStore();
  
  const refreshBalance = useCallback(async () => {
    if (wallet.address) {
      const balance = await walletService.getBalance(wallet.address);
      setWallet({ balance });
    }
  }, [wallet.address, setWallet]);
  
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      refreshBalance();
      
      // Refresh balance periodically
      const interval = setInterval(refreshBalance, UI_CONFIG.REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.address, refreshBalance]);
  
  return {
    ...wallet,
    disconnect,
    refreshBalance,
  };
};

// ============================================================================
// useContract - Smart contract interactions
// ============================================================================

export const useContract = () => {
  const { wallet } = useWalletStore();
  const { setLoading, setError } = useAppStore();
  
  const getTokenBalance = useCallback(async (tokenAddress: string) => {
    if (!wallet.address) return '0';
    
    try {
      setLoading(true);
      const tokenContract = blockchainService.getTokenContract(tokenAddress);
      const balance = await tokenContract.balanceOf(wallet.address);
      return balance;
    } catch (error: any) {
      setError(error.message);
      return '0';
    } finally {
      setLoading(false);
    }
  }, [wallet.address, setLoading, setError]);
  
  const approveToken = useCallback(async (
    tokenAddress: string,
    spender: string,
    amount: string
  ) => {
    try {
      setLoading(true);
      const tokenContract = blockchainService.getTokenContract(tokenAddress);
      const result = await tokenContract.approve(spender, amount);
      return result;
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);
  
  const transferToken = useCallback(async (
    tokenAddress: string,
    to: string,
    amount: string
  ) => {
    try {
      setLoading(true);
      const tokenContract = blockchainService.getTokenContract(tokenAddress);
      const result = await tokenContract.transfer(to, amount);
      return result;
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);
  
  return {
    getTokenBalance,
    approveToken,
    transferToken,
  };
};

// ============================================================================
// useAMM - AMM Pool interactions
// ============================================================================

export const useAMM = (poolAddress?: string) => {
  const { wallet } = useWalletStore();
  const { setLoading, setError } = useAppStore();
  const { poolReserves, setPoolReserves } = useContractStore();
  
  const fetchPoolReserves = useCallback(async () => {
    if (!poolAddress) return;
    
    try {
      setLoading(true);
      const pool = blockchainService.getPoolContract(poolAddress);
      const reserves = await pool.getReserves();
      const totalSupply = await pool.totalSupply();
      const userLiquidity = wallet.address ? await pool.balanceOf(wallet.address) : '0';
      
      const reservesData: PoolReserves = {
        reserveToken: reserves.reserveToken,
        reserveETH: reserves.reserveETH,
        totalSupply,
        userLiquidity,
        shareOfPool: totalSupply !== '0' 
          ? ((parseFloat(userLiquidity) / parseFloat(totalSupply)) * 100).toFixed(2)
          : '0',
      };
      
      setPoolReserves(reservesData);
      return reservesData;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [poolAddress, wallet.address, setLoading, setError, setPoolReserves]);
  
  const addLiquidity = useCallback(async (
    tokenAmount: string,
    ethAmount: string,
    slippage: number = 0.5
  ) => {
    if (!poolAddress) return { success: false, error: 'Pool address not set' };
    
    try {
      setLoading(true);
      const minTokenAmount = (parseFloat(tokenAmount) * (100 - slippage) / 100).toString();
      const minETHAmount = (parseFloat(ethAmount) * (100 - slippage) / 100).toString();
      
      const pool = blockchainService.getPoolContract(poolAddress);
      const result = await pool.addLiquidity(tokenAmount, ethAmount, minTokenAmount, minETHAmount);
      
      if (result.success) {
        await fetchPoolReserves();
      }
      
      return result;
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [poolAddress, setLoading, setError, fetchPoolReserves]);
  
  const removeLiquidity = useCallback(async (
    lpAmount: string,
    slippage: number = 0.5
  ) => {
    if (!poolAddress || !poolReserves) {
      return { success: false, error: 'Pool not initialized' };
    }
    
    try {
      setLoading(true);
      
      // Calculate minimum amounts based on current reserves
      const share = parseFloat(lpAmount) / parseFloat(poolReserves.totalSupply);
      const tokenAmount = parseFloat(poolReserves.reserveToken) * share;
      const ethAmount = parseFloat(poolReserves.reserveETH) * share;
      
      const minTokenAmount = (tokenAmount * (100 - slippage) / 100).toString();
      const minETHAmount = (ethAmount * (100 - slippage) / 100).toString();
      
      const pool = blockchainService.getPoolContract(poolAddress);
      const result = await pool.removeLiquidity(lpAmount, minTokenAmount, minETHAmount);
      
      if (result.success) {
        await fetchPoolReserves();
      }
      
      return result;
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [poolAddress, poolReserves, setLoading, setError, fetchPoolReserves]);
  
  const swapTokenForETH = useCallback(async (
    tokenAmount: string,
    slippage: number = 0.5
  ) => {
    if (!poolAddress || !poolReserves) {
      return { success: false, error: 'Pool not initialized' };
    }
    
    try {
      setLoading(true);
      
      const pool = blockchainService.getPoolContract(poolAddress);
      const outputAmount = pool.calculateSwapOutput(
        tokenAmount,
        poolReserves.reserveToken,
        poolReserves.reserveETH
      );
      
      const minOutput = (parseFloat(outputAmount) * (100 - slippage) / 100).toString();
      const result = await pool.swapTokenForETH(tokenAmount, minOutput);
      
      if (result.success) {
        await fetchPoolReserves();
      }
      
      return result;
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [poolAddress, poolReserves, setLoading, setError, fetchPoolReserves]);
  
  const swapETHForToken = useCallback(async (
    ethAmount: string,
    slippage: number = 0.5
  ) => {
    if (!poolAddress || !poolReserves) {
      return { success: false, error: 'Pool not initialized' };
    }
    
    try {
      setLoading(true);
      
      const pool = blockchainService.getPoolContract(poolAddress);
      const outputAmount = pool.calculateSwapOutput(
        ethAmount,
        poolReserves.reserveETH,
        poolReserves.reserveToken
      );
      
      const minOutput = (parseFloat(outputAmount) * (100 - slippage) / 100).toString();
      const result = await pool.swapETHForToken(ethAmount, minOutput);
      
      if (result.success) {
        await fetchPoolReserves();
      }
      
      return result;
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [poolAddress, poolReserves, setLoading, setError, fetchPoolReserves]);
  
  // Auto-fetch reserves on mount and periodically
  useEffect(() => {
    if (poolAddress) {
      fetchPoolReserves();
      
      const interval = setInterval(fetchPoolReserves, UI_CONFIG.REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [poolAddress, fetchPoolReserves]);
  
  return {
    poolReserves,
    fetchPoolReserves,
    addLiquidity,
    removeLiquidity,
    swapTokenForETH,
    swapETHForToken,
  };
};

// ============================================================================
// useAssets - Fetch and manage assets
// ============================================================================

export const useAssets = () => {
  const { wallet } = useWalletStore();
  const { assets, setAssets } = useContractStore();
  const { setLoading, setError } = useAppStore();
  
  const fetchAssets = useCallback(async () => {
    if (!wallet.address) return;
    
    try {
      setLoading(true);
      const response = await apiService.getUserAssets(wallet.address);
      
      if (response.success && response.data) {
        setAssets(response.data);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [wallet.address, setLoading, setError, setAssets]);
  
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      fetchAssets();
      
      const interval = setInterval(fetchAssets, UI_CONFIG.REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.address, fetchAssets]);
  
  return {
    assets,
    fetchAssets,
  };
};

// ============================================================================
// useTransactions - Fetch and manage transactions
// ============================================================================

export const useTransactions = () => {
  const { wallet } = useWalletStore();
  const { transactions } = useContractStore();
  const [loading, setLoading] = useState(false);
  
  const fetchTransactions = useCallback(async () => {
    if (!wallet.address) return;
    
    try {
      setLoading(true);
      const response = await apiService.getUserTransactions(wallet.address);
      
      if (response.success && response.data) {
        // Update store with fetched transactions
        console.log('Fetched transactions:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);
  
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      fetchTransactions();
    }
  }, [wallet.isConnected, wallet.address, fetchTransactions]);
  
  return {
    transactions,
    loading,
    fetchTransactions,
  };
};

// ============================================================================
// useDebounce - Debounce value changes
// ============================================================================

export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// ============================================================================
// useInterval - Run callback on interval
// ============================================================================

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};
