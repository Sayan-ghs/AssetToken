import React, { createContext, useContext, ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected, walletConnect } from 'wagmi/connectors'

// Configure chains & providers
const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id' 
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
})

interface Web3ContextType {
  config: typeof config
}

const Web3Context = createContext<Web3ContextType>({ config })

export const useWeb3 = () => useContext(Web3Context)

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3Context.Provider value={{ config }}>
          {children}
        </Web3Context.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
