import { getAMMPool } from "../blockchain/contracts.js";

export async function getPoolState(poolAddress){
     const pool = getAMMPool(poolAddress)

     const [reserveA, reserveB, totalLiquidity] =
     await pool.getReserves();

     return {
          reserveA:reserveA.toString(),
          reserveB:reserveB.toString(),
          totalLiquidity:totalLiquidity.toString()
     }
}

export function simulateSwap(amountIn,reserveIn,reserveOut,feeBps){
     const feeMultiplier = 10_000n - BigInt(feeBps);
     const amountInWithFee = BigInt(amountIn) * feeMultiplier;

     const numerator = amountInWithFee * BigInt(reserveOut);
     const denominator =
    (BigInt(reserveIn) * 10_000n) + amountInWithFee;

  return numerator / denominator;
}