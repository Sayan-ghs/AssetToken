import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { AssetTokenABI, AssetRegistryABI, PrimarySaleABI, AMMPoolABI } from '../contracts/abis'

// Asset Token Hooks
export const useAssetTokenBalance = (tokenAddress: string) => {
  const { address } = useAccount()
  
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: AssetTokenABI,
    functionName: 'balanceOf',
    args: [address],
  })
}

export const useAssetTokenInfo = (tokenAddress: string) => {
  const name = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: AssetTokenABI,
    functionName: 'name',
  })
  
  const symbol = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: AssetTokenABI,
    functionName: 'symbol',
  })
  
  const totalSupply = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: AssetTokenABI,
    functionName: 'totalSupply',
  })
  
  return { name, symbol, totalSupply }
}

export const useTransferToken = () => {
  const { writeContract } = useWriteContract()
  
  const transfer = (tokenAddress: string, to: string, amount: bigint) => {
    return writeContract({
      address: tokenAddress as `0x${string}`,
      abi: AssetTokenABI,
      functionName: 'transfer',
      args: [to, amount],
    })
  }
  
  return { transfer }
}

// Asset Registry Hooks
export const useAssetDetails = (registryAddress: string, assetId: number) => {
  return useReadContract({
    address: registryAddress as `0x${string}`,
    abi: AssetRegistryABI,
    functionName: 'getAsset',
    args: [BigInt(assetId)],
  })
}

export const useRegisterAsset = () => {
  const { writeContract } = useWriteContract()
  
  const registerAsset = (
    registryAddress: string,
    tokenAddress: string,
    assetType: string,
    location: string,
    documentHash: string
  ) => {
    return writeContract({
      address: registryAddress as `0x${string}`,
      abi: AssetRegistryABI,
      functionName: 'registerAsset',
      args: [tokenAddress, assetType, location, documentHash as `0x${string}`],
    })
  }
  
  return { registerAsset }
}

// Primary Sale Hooks
export const useSaleDetails = (saleAddress: string, saleId: number) => {
  return useReadContract({
    address: saleAddress as `0x${string}`,
    abi: PrimarySaleABI,
    functionName: 'getSale',
    args: [BigInt(saleId)],
  })
}

export const useBuyTokens = () => {
  const { writeContract } = useWriteContract()
  
  const buyTokens = (saleAddress: string, saleId: number, ethAmount: bigint) => {
    return writeContract({
      address: saleAddress as `0x${string}`,
      abi: PrimarySaleABI,
      functionName: 'buyTokens',
      args: [BigInt(saleId)],
      value: ethAmount,
    })
  }
  
  return { buyTokens }
}

// AMM Pool Hooks
export const usePoolReserves = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: AMMPoolABI,
    functionName: 'getReserves',
  })
}

export const usePoolPrice = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: AMMPoolABI,
    functionName: 'getPrice',
  })
}

export const useSwapTokens = () => {
  const { writeContract } = useWriteContract()
  
  const swapTokenForETH = (poolAddress: string, tokenAmount: bigint, minETHOut: bigint) => {
    return writeContract({
      address: poolAddress as `0x${string}`,
      abi: AMMPoolABI,
      functionName: 'swapTokenForETH',
      args: [tokenAmount, minETHOut],
    })
  }
  
  const swapETHForToken = (poolAddress: string, minTokenOut: bigint, ethAmount: bigint) => {
    return writeContract({
      address: poolAddress as `0x${string}`,
      abi: AMMPoolABI,
      functionName: 'swapETHForToken',
      args: [minTokenOut],
      value: ethAmount,
    })
  }
  
  return { swapTokenForETH, swapETHForToken }
}

export const useAddLiquidity = () => {
  const { writeContract } = useWriteContract()
  
  const addLiquidity = (poolAddress: string, tokenAmount: bigint, ethAmount: bigint) => {
    return writeContract({
      address: poolAddress as `0x${string}`,
      abi: AMMPoolABI,
      functionName: 'addLiquidity',
      args: [tokenAmount, ethAmount],
      value: ethAmount,
    })
  }
  
  return { addLiquidity }
}
