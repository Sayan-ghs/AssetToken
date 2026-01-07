/**
 * BLOCKCHAIN SERVICE
 * Handles all smart contract interactions using ethers.js
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, TX_CONFIG, ERROR_MESSAGES } from '../../constants';
import { walletService } from '../wallet';
import {
  AssetTokenABI,
  AssetRegistryABI,
  AMMPoolABI,
  OraclePriceFeedABI,
  ProofOfReserveABI,
  PlatformFeeControllerABI,
} from './abis';
import { ContractCallResult } from '../../types';

// ============================================================================
// BASE CONTRACT CLASS
// ============================================================================

class BaseContract {
  protected contract: ethers.Contract | null = null;
  protected readonly address: string;
  protected readonly abi: any[];
  
  constructor(address: string, abi: any[]) {
    this.address = address;
    this.abi = abi;
  }
  
  /**
   * Initialize contract with signer
   */
  protected init(): ethers.Contract {
    const signer = walletService.getSigner();
    if (!signer) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }
    
    if (!this.contract) {
      this.contract = new ethers.Contract(this.address, this.abi, signer);
    }
    
    return this.contract;
  }
  
  /**
   * Get contract for reading (with provider)
   */
  protected getReadContract(): ethers.Contract {
    const provider = walletService.getProvider();
    if (!provider) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }
    
    return new ethers.Contract(this.address, this.abi, provider);
  }
  
  /**
   * Execute read call
   */
  protected async read(method: string, args: any[] = []): Promise<any> {
    try {
      const contract = this.getReadContract();
      const result = await contract[method](...args);
      console.log(`✅ Read ${method}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Read ${method} failed:`, error);
      throw error;
    }
  }
  
  /**
   * Execute write call
   */
  protected async write(
    method: string,
    args: any[] = [],
    value?: string,
    gasLimit?: number
  ): Promise<ContractCallResult> {
    try {
      const contract = this.init();
      
      const options: any = {};
      if (value) {
        options.value = ethers.parseEther(value);
      }
      if (gasLimit) {
        options.gasLimit = gasLimit;
      }
      
      console.log(`🔄 Executing ${method}...`, { args, options });
      
      const tx = await contract[method](...args, options);
      console.log(`📤 Transaction sent:`, tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait(TX_CONFIG.CONFIRMATION_BLOCKS);
      console.log(`✅ Transaction confirmed:`, receipt.hash);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        data: receipt,
      };
    } catch (error: any) {
      console.error(`❌ Write ${method} failed:`, error);
      
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.CONTRACT_ERROR,
      };
    }
  }
  
  /**
   * Estimate gas for transaction
   */
  protected async estimateGas(method: string, args: any[] = [], value?: string): Promise<bigint> {
    try {
      const contract = this.init();
      
      const options: any = {};
      if (value) {
        options.value = ethers.parseEther(value);
      }
      
      const gasEstimate = await contract[method].estimateGas(...args, options);
      return gasEstimate;
    } catch (error) {
      console.error(`❌ Gas estimation failed:`, error);
      return BigInt(TX_CONFIG.DEFAULT_GAS_LIMIT);
    }
  }
}

// ============================================================================
// ASSET TOKEN CONTRACT
// ============================================================================

export class AssetTokenContract extends BaseContract {
  constructor(tokenAddress: string = CONTRACT_ADDRESSES.ASSET_TOKEN) {
    super(tokenAddress, AssetTokenABI);
  }
  
  async name(): Promise<string> {
    return await this.read('name');
  }
  
  async symbol(): Promise<string> {
    return await this.read('symbol');
  }
  
  async decimals(): Promise<number> {
    return await this.read('decimals');
  }
  
  async totalSupply(): Promise<string> {
    const supply = await this.read('totalSupply');
    return ethers.formatEther(supply);
  }
  
  async balanceOf(address: string): Promise<string> {
    const balance = await this.read('balanceOf', [address]);
    return ethers.formatEther(balance);
  }
  
  async allowance(owner: string, spender: string): Promise<string> {
    const allowance = await this.read('allowance', [owner, spender]);
    return ethers.formatEther(allowance);
  }
  
  async transfer(to: string, amount: string): Promise<ContractCallResult> {
    const amountWei = ethers.parseEther(amount);
    return await this.write('transfer', [to, amountWei]);
  }
  
  async approve(spender: string, amount: string): Promise<ContractCallResult> {
    const amountWei = ethers.parseEther(amount);
    return await this.write('approve', [spender, amountWei]);
  }
}

// ============================================================================
// ASSET REGISTRY CONTRACT
// ============================================================================

export class AssetRegistryContract extends BaseContract {
  constructor() {
    super(CONTRACT_ADDRESSES.ASSET_REGISTRY, AssetRegistryABI);
  }
  
  async getAsset(assetId: number): Promise<{
    token: string;
    owner: string;
    metadataURI: string;
    active: boolean;
  }> {
    const asset = await this.read('getAsset', [assetId]);
    return {
      token: asset[0],
      owner: asset[1],
      metadataURI: asset[2],
      active: asset[3],
    };
  }
  
  async assetCount(): Promise<number> {
    return await this.read('assetCount');
  }
  
  async getAssetIdByToken(token: string): Promise<number> {
    return await this.read('getAssetIdByToken', [token]);
  }
  
  async registerAsset(token: string, metadataURI: string): Promise<ContractCallResult> {
    return await this.write('registerAsset', [token, metadataURI]);
  }
  
  async deactivateAsset(assetId: number): Promise<ContractCallResult> {
    return await this.write('deactivateAsset', [assetId]);
  }
}

// ============================================================================
// AMM POOL CONTRACT
// ============================================================================

export class AMMPoolContract extends BaseContract {
  constructor(poolAddress: string = CONTRACT_ADDRESSES.AMM_POOL) {
    super(poolAddress, AMMPoolABI);
  }
  
  async getReserves(): Promise<{ reserveToken: string; reserveETH: string }> {
    const reserveToken = await this.read('reserveToken');
    const reserveETH = await this.read('reserveETH');
    
    return {
      reserveToken: ethers.formatEther(reserveToken),
      reserveETH: ethers.formatEther(reserveETH),
    };
  }
  
  async totalSupply(): Promise<string> {
    const supply = await this.read('totalSupply');
    return ethers.formatEther(supply);
  }
  
  async balanceOf(address: string): Promise<string> {
    const balance = await this.read('balanceOf', [address]);
    return ethers.formatEther(balance);
  }
  
  async addLiquidity(
    tokenAmount: string,
    ethAmount: string,
    minTokenAmount: string,
    minETHAmount: string
  ): Promise<ContractCallResult> {
    const tokenAmountWei = ethers.parseEther(tokenAmount);
    const minTokenAmountWei = ethers.parseEther(minTokenAmount);
    const minETHAmountWei = ethers.parseEther(minETHAmount);
    
    return await this.write(
      'addLiquidity',
      [tokenAmountWei, minTokenAmountWei, minETHAmountWei],
      ethAmount
    );
  }
  
  async removeLiquidity(
    liquidity: string,
    minTokenAmount: string,
    minETHAmount: string
  ): Promise<ContractCallResult> {
    const liquidityWei = ethers.parseEther(liquidity);
    const minTokenAmountWei = ethers.parseEther(minTokenAmount);
    const minETHAmountWei = ethers.parseEther(minETHAmount);
    
    return await this.write('removeLiquidity', [liquidityWei, minTokenAmountWei, minETHAmountWei]);
  }
  
  async swapTokenForETH(tokenAmount: string, minETHOut: string): Promise<ContractCallResult> {
    const tokenAmountWei = ethers.parseEther(tokenAmount);
    const minETHOutWei = ethers.parseEther(minETHOut);
    
    return await this.write('swapTokenForETH', [tokenAmountWei, minETHOutWei]);
  }
  
  async swapETHForToken(ethAmount: string, minTokenOut: string): Promise<ContractCallResult> {
    const minTokenOutWei = ethers.parseEther(minTokenOut);
    
    return await this.write('swapETHForToken', [minTokenOutWei], ethAmount);
  }
  
  /**
   * Calculate output amount for swap
   */
  calculateSwapOutput(
    amountIn: string,
    reserveIn: string,
    reserveOut: string
  ): string {
    try {
      const amountInBigInt = ethers.parseEther(amountIn);
      const reserveInBigInt = ethers.parseEther(reserveIn);
      const reserveOutBigInt = ethers.parseEther(reserveOut);
      
      // Apply 0.3% fee
      const amountInWithFee = amountInBigInt * BigInt(997);
      const numerator = amountInWithFee * reserveOutBigInt;
      const denominator = (reserveInBigInt * BigInt(1000)) + amountInWithFee;
      const amountOut = numerator / denominator;
      
      return ethers.formatEther(amountOut);
    } catch {
      return '0';
    }
  }
}

// ============================================================================
// ORACLE PRICE FEED CONTRACT
// ============================================================================

export class OraclePriceFeedContract extends BaseContract {
  constructor() {
    super(CONTRACT_ADDRESSES.ORACLE_PRICE_FEED, OraclePriceFeedABI);
  }
  
  async getLatestPrice(asset: string): Promise<string> {
    const price = await this.read('getLatestPrice', [asset]);
    return ethers.formatEther(price);
  }
  
  async getPrice(asset: string): Promise<{ price: string; timestamp: number }> {
    const result = await this.read('getPrice', [asset]);
    return {
      price: ethers.formatEther(result[0]),
      timestamp: Number(result[1]),
    };
  }
}

// ============================================================================
// PROOF OF RESERVE CONTRACT
// ============================================================================

export class ProofOfReserveContract extends BaseContract {
  constructor() {
    super(CONTRACT_ADDRESSES.PROOF_OF_RESERVE, ProofOfReserveABI);
  }
  
  async getReserve(): Promise<{
    amount: string;
    timestamp: number;
    proofHash: string;
  }> {
    const result = await this.read('getReserve');
    return {
      amount: ethers.formatEther(result[0]),
      timestamp: Number(result[1]),
      proofHash: result[2],
    };
  }
  
  async verifyReserve(): Promise<boolean> {
    return await this.read('verifyReserve');
  }
}

// ============================================================================
// PLATFORM FEE CONTROLLER CONTRACT
// ============================================================================

export class PlatformFeeControllerContract extends BaseContract {
  constructor() {
    super(CONTRACT_ADDRESSES.PLATFORM_FEE_CONTROLLER, PlatformFeeControllerABI);
  }
  
  async getFee(): Promise<string> {
    const fee = await this.read('getFee');
    return fee.toString();
  }
}

// ============================================================================
// BLOCKCHAIN SERVICE (Facade for all contracts)
// ============================================================================

export class BlockchainService {
  assetToken: AssetTokenContract;
  assetRegistry: AssetRegistryContract;
  ammPool: AMMPoolContract;
  oracle: OraclePriceFeedContract;
  reserve: ProofOfReserveContract;
  feeController: PlatformFeeControllerContract;
  
  constructor() {
    this.assetToken = new AssetTokenContract();
    this.assetRegistry = new AssetRegistryContract();
    this.ammPool = new AMMPoolContract();
    this.oracle = new OraclePriceFeedContract();
    this.reserve = new ProofOfReserveContract();
    this.feeController = new PlatformFeeControllerContract();
  }
  
  /**
   * Create contract instance for specific token
   */
  getTokenContract(tokenAddress: string): AssetTokenContract {
    return new AssetTokenContract(tokenAddress);
  }
  
  /**
   * Create contract instance for specific pool
   */
  getPoolContract(poolAddress: string): AMMPoolContract {
    return new AMMPoolContract(poolAddress);
  }
}

export const blockchainService = new BlockchainService();
