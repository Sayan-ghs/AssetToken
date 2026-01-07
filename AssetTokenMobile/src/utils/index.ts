/**
 * UTILITY FUNCTIONS
 * Helper functions used throughout the application
 */

import { ethers } from 'ethers';
import { VALIDATION } from '../constants';

// ============================================================================
// ADDRESS UTILITIES
// ============================================================================

/**
 * Validates an Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Formats an Ethereum address for display (0x1234...5678)
 */
export const formatAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Checks if two addresses are equal (case-insensitive)
 */
export const addressesEqual = (addr1: string, addr2: string): boolean => {
  try {
    return ethers.getAddress(addr1) === ethers.getAddress(addr2);
  } catch {
    return false;
  }
};

// ============================================================================
// NUMBER FORMATTING UTILITIES
// ============================================================================

/**
 * Formats a number with commas and decimals
 */
export const formatNumber = (
  value: string | number,
  decimals: number = 2,
  showPlus: boolean = false
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  const prefix = showPlus && num > 0 ? '+' : '';
  return prefix + num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formats a large number with K, M, B suffixes
 */
export const formatLargeNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

/**
 * Formats a percentage value
 */
export const formatPercent = (value: string | number, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(decimals)}%`;
};

/**
 * Formats currency values
 */
export const formatCurrency = (
  value: string | number,
  currency: string = 'USD',
  decimals: number = 2
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// ============================================================================
// BLOCKCHAIN UTILITIES
// ============================================================================

/**
 * Formats Wei to Ether
 */
export const formatEther = (wei: string | bigint, decimals: number = 4): string => {
  try {
    const ether = ethers.formatEther(wei);
    return parseFloat(ether).toFixed(decimals);
  } catch {
    return '0';
  }
};

/**
 * Parses Ether to Wei
 */
export const parseEther = (ether: string): bigint => {
  try {
    return ethers.parseEther(ether);
  } catch {
    return BigInt(0);
  }
};

/**
 * Formats token amount based on decimals
 */
export const formatTokenAmount = (
  amount: string | bigint,
  decimals: number = 18,
  displayDecimals: number = 4
): string => {
  try {
    const formatted = ethers.formatUnits(amount, decimals);
    return parseFloat(formatted).toFixed(displayDecimals);
  } catch {
    return '0';
  }
};

/**
 * Parses token amount based on decimals
 */
export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  try {
    return ethers.parseUnits(amount, decimals);
  } catch {
    return BigInt(0);
  }
};

/**
 * Calculates gas price with buffer
 */
export const calculateGasPrice = (baseGasPrice: bigint, multiplier: number = 1.1): bigint => {
  return (baseGasPrice * BigInt(Math.floor(multiplier * 100))) / BigInt(100);
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates amount input
 */
export const validateAmount = (amount: string): { valid: boolean; error?: string } => {
  if (!amount || amount.trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }
  
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (num < VALIDATION.MIN_AMOUNT) {
    return { valid: false, error: `Minimum amount is ${VALIDATION.MIN_AMOUNT}` };
  }
  
  if (num > VALIDATION.MAX_AMOUNT) {
    return { valid: false, error: `Maximum amount is ${VALIDATION.MAX_AMOUNT}` };
  }
  
  return { valid: true };
};

/**
 * Validates balance for transaction
 */
export const hasInsufficientBalance = (amount: string, balance: string): boolean => {
  try {
    const amountBigInt = parseEther(amount);
    const balanceBigInt = parseEther(balance);
    return amountBigInt > balanceBigInt;
  } catch {
    return true;
  }
};

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Formats timestamp to readable date
 */
export const formatDate = (timestamp: number, includeTime: boolean = false): string => {
  const date = new Date(timestamp * 1000);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Gets relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

/**
 * Checks if timestamp is in the past
 */
export const isPast = (timestamp: number): boolean => {
  return timestamp * 1000 < Date.now();
};

/**
 * Checks if timestamp is in the future
 */
export const isFuture = (timestamp: number): boolean => {
  return timestamp * 1000 > Date.now();
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncates text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalizes first letter
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Generates initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculates percentage change
 */
export const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calculates price impact for swaps
 */
export const calculatePriceImpact = (
  amountIn: string,
  amountOut: string,
  reserveIn: string,
  reserveOut: string
): string => {
  try {
    const amountInBigInt = parseEther(amountIn);
    const reserveInBigInt = parseEther(reserveIn);
    const reserveOutBigInt = parseEther(reserveOut);
    
    // Expected output without price impact
    const expectedOutput = (amountInBigInt * reserveOutBigInt) / reserveInBigInt;
    
    // Actual output
    const actualOutputBigInt = parseEther(amountOut);
    
    // Price impact percentage
    const impact = ((expectedOutput - actualOutputBigInt) * BigInt(10000)) / expectedOutput;
    
    return (Number(impact) / 100).toFixed(2);
  } catch {
    return '0';
  }
};

/**
 * Calculates minimum received with slippage
 */
export const calculateMinimumReceived = (amount: string, slippage: number): string => {
  try {
    const amountBigInt = parseEther(amount);
    const slippageBigInt = BigInt(Math.floor(slippage * 100));
    const minReceived = (amountBigInt * (BigInt(10000) - slippageBigInt)) / BigInt(10000);
    return formatEther(minReceived);
  } catch {
    return '0';
  }
};

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Extracts readable error message from error object
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error?.reason) return error.reason;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  
  if (error?.code === 'ACTION_REJECTED') return 'Transaction rejected by user';
  if (error?.code === 'INSUFFICIENT_FUNDS') return 'Insufficient funds';
  if (error?.code === 'NETWORK_ERROR') return 'Network error. Please try again';
  
  return 'An unexpected error occurred';
};

// ============================================================================
// DEBOUNCE/THROTTLE UTILITIES
// ============================================================================

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttles a function call
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// ============================================================================
// SLEEP UTILITY
// ============================================================================

/**
 * Delays execution for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
