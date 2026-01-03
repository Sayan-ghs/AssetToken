import { getAssetToken } from "../blockchain/contracts.js";

export async function getTokenInfo(tokenAddress,user){
     const token = getAssetToken(tokenAddress)

     const [name,symbol,supply,balance] = await Promise.all([
          token.name(),
          token.symbol(),
          token.totalSupply(),
          token.balanceOf(user)
     ]);
     return {
          name,
          symbol,
          supply:supply.toString(),
          balance:balance.toString()
     }
}

export async function getBalance(tokenAddress,user){
     const token = getAssetToken(tokenAddress)
     const balance = await token.balanceOf(user)
     return balance.toString()
}