/**
 * WALLET SERVICE
 * Handles WalletConnect v2 integration and wallet management
 */

import '@walletconnect/react-native-compat';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';
import { WALLET_CONNECT_CONFIG, DEFAULT_NETWORK, ERROR_MESSAGES } from '../../constants';

// ============================================================================
// WALLET SERVICE CLASS
// ============================================================================

class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  
  /**
   * Initialize WalletConnect provider from session
   */
  async initializeFromSession(wcProvider: any): Promise<{
    address: string;
    chainId: number;
    provider: ethers.BrowserProvider;
    signer: ethers.JsonRpcSigner;
  }> {
    try {
      // Create ethers provider from WalletConnect provider
      this.provider = new ethers.BrowserProvider(wcProvider);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      
      console.log('✅ Wallet initialized:', { address, chainId });
      
      return {
        address,
        chainId,
        provider: this.provider,
        signer: this.signer,
      };
    } catch (error) {
      console.error('❌ Failed to initialize wallet:', error);
      throw new Error('Failed to initialize wallet connection');
    }
  }
  
  /**
   * Get current balance
   */
  async getBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      }
      
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get balance:', error);
      return '0';
    }
  }
  
  /**
   * Switch network
   */
  async switchNetwork(chainId: number): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      }
      
      // Request network switch
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${chainId.toString(16)}` },
      ]);
      
      console.log('✅ Network switched to:', chainId);
    } catch (error: any) {
      console.error('❌ Failed to switch network:', error);
      
      // If network doesn't exist, try to add it
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Add network to wallet
   */
  private async addNetwork(chainId: number): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      }
      
      const networkConfig = Object.values(require('../../constants').NETWORK_CONFIG).find(
        (config: any) => config.chainId === chainId
      );
      
      if (!networkConfig) {
        throw new Error('Network configuration not found');
      }
      
      await this.provider.send('wallet_addEthereumChain', [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: (networkConfig as any).name,
          nativeCurrency: (networkConfig as any).nativeCurrency,
          rpcUrls: [(networkConfig as any).rpcUrl],
          blockExplorerUrls: [(networkConfig as any).explorerUrl],
        },
      ]);
      
      console.log('✅ Network added:', chainId);
    } catch (error) {
      console.error('❌ Failed to add network:', error);
      throw error;
    }
  }
  
  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      }
      
      const signature = await this.signer.signMessage(message);
      console.log('✅ Message signed');
      
      return signature;
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw error;
    }
  }
  
  /**
   * Get current signer
   */
  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }
  
  /**
   * Get current provider
   */
  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
  
  /**
   * Reset wallet service
   */
  reset(): void {
    this.provider = null;
    this.signer = null;
    console.log('✅ Wallet service reset');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const walletService = new WalletService();

// ============================================================================
// WALLETCONNECT CONFIGURATION
// ============================================================================

export const walletConnectConfig = {
  projectId: WALLET_CONNECT_CONFIG.PROJECT_ID,
  metadata: WALLET_CONNECT_CONFIG.METADATA,
  providerMetadata: {
    name: WALLET_CONNECT_CONFIG.METADATA.name,
    description: WALLET_CONNECT_CONFIG.METADATA.description,
    url: WALLET_CONNECT_CONFIG.METADATA.url,
    icons: WALLET_CONNECT_CONFIG.METADATA.icons,
    redirect: WALLET_CONNECT_CONFIG.METADATA.redirect,
  },
};
