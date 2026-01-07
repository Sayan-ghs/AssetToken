import { getPrimarySale } from "../blockchain/contracts.js";

export async function getSaleDetails(saleAddress, tokenAddress) {
     const sale = getPrimarySale(saleAddress);
     const s = await sale.getSale(tokenAddress);

     return {
          seller: s.seller,
          pricePerToken: s.pricePerToken.toString(),
          tokensForSale: s.tokensForSale.toString(),
          tokensSold: s.tokensSold.toString(),
          startTime: Number(s.startTime),
          endTime: Number(s.endTime),
          isActive: s.active
     };
}

export function calculateSaleCost(pricePerToken, amount) {
     return BigInt(pricePerToken) * BigInt(amount);
}