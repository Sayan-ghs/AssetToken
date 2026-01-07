/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_RPC_URL: string
  readonly VITE_ASSET_TOKEN_ADDRESS: string
  readonly VITE_ASSET_REGISTRY_ADDRESS: string
  readonly VITE_PRIMARY_SALE_ADDRESS: string
  readonly VITE_AMM_POOL_ADDRESS: string
  readonly VITE_ORACLE_PRICE_FEED_ADDRESS: string
  readonly VITE_PROOF_OF_RESERVE_ADDRESS: string
  readonly VITE_PLATFORM_FEE_CONTROLLER_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
