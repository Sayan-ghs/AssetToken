/**
 * API SERVICE
 * Handles all backend API calls with Axios
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../../constants';
import { ApiResponse } from '../../types';
import { getErrorMessage } from '../../utils';

// ============================================================================
// API CLIENT
// ============================================================================

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.url}`, response.status);
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ API Error:', error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }
  
  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.message || ERROR_MESSAGES.API_ERROR;
      return new Error(message);
    } else if (error.request) {
      // No response received
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      // Request setup error
      return new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
  
  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(endpoint, { params, ...config });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }
  
  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(endpoint, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }
  
  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(endpoint, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }
  
  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(endpoint, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }
}

// ============================================================================
// API SERVICE (High-level API methods)
// ============================================================================

class ApiService {
  private client: ApiClient;
  
  constructor() {
    this.client = new ApiClient();
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.client.setAuthToken(token);
  }
  
  // ========== TOKEN APIs ==========
  
  async getTokenInfo(tokenAddress: string): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.TOKEN.INFO, { address: tokenAddress });
  }
  
  async getTokenBalance(address: string, tokenAddress: string): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.TOKEN.BALANCE, {
      userAddress: address,
      tokenAddress,
    });
  }
  
  // ========== SALE APIs ==========
  
  async getSalesList(): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.SALE.LIST);
  }
  
  async getSaleDetails(saleId: string): Promise<ApiResponse> {
    return this.client.get(`${API_CONFIG.ENDPOINTS.SALE.DETAILS}/${saleId}`);
  }
  
  // ========== AMM APIs ==========
  
  async getPoolReserves(poolAddress: string): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.AMM.RESERVES, { poolAddress });
  }
  
  async getPoolPrice(poolAddress: string): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.AMM.PRICE, { poolAddress });
  }
  
  // ========== RESERVE APIs ==========
  
  async getReserveInfo(): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.RESERVE.INFO);
  }
  
  async verifyReserve(): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.RESERVE.VERIFY);
  }
  
  // ========== ORACLE APIs ==========
  
  async getAssetPrice(assetAddress: string): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.ORACLE.PRICE, { asset: assetAddress });
  }
  
  // ========== FEE APIs ==========
  
  async getFeeInfo(): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.FEE.INFO);
  }
  
  // ========== USER APIs ==========
  
  async getUserProfile(address: string): Promise<ApiResponse> {
    return this.client.get(`${API_CONFIG.ENDPOINTS.USER.PROFILE}/${address}`);
  }
  
  async getUserTransactions(address: string, page: number = 1): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.USER.TRANSACTIONS, {
      address,
      page,
      limit: 20,
    });
  }
  
  async getUserAssets(address: string): Promise<ApiResponse> {
    return this.client.get(API_CONFIG.ENDPOINTS.USER.ASSETS, { address });
  }
}

export const apiService = new ApiService();
