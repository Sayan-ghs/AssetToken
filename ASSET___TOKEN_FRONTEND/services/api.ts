import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token API
export const tokenApi = {
  getAll: () => apiClient.get('/token'),
  getById: (id: string) => apiClient.get(`/token/${id}`),
  getMetadata: (tokenAddress: string) => apiClient.get(`/token/metadata/${tokenAddress}`),
}

// Sale API
export const saleApi = {
  getAll: () => apiClient.get('/sale'),
  getById: (id: string) => apiClient.get(`/sale/${id}`),
  getSaleDetails: (saleAddress: string) => apiClient.get(`/sale/details/${saleAddress}`),
}

// AMM API
export const ammApi = {
  getAll: () => apiClient.get('/amm'),
  getPoolInfo: (poolAddress: string) => apiClient.get(`/amm/pool/${poolAddress}`),
  getPrice: (tokenA: string, tokenB: string) => apiClient.get(`/amm/price/${tokenA}/${tokenB}`),
}

// Reserve API
export const reserveApi = {
  getAll: () => apiClient.get('/reserve'),
  getProof: (reserveAddress: string) => apiClient.get(`/reserve/proof/${reserveAddress}`),
}

// Fee API
export const feeApi = {
  getFees: () => apiClient.get('/fee'),
}

// Oracle API
export const oracleApi = {
  getPrice: (assetId: string) => apiClient.get(`/oracle/price/${assetId}`),
  getAll: () => apiClient.get('/oracle'),
}

export default apiClient
