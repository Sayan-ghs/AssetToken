import { ethers } from "ethers";
import { getAMMPool } from "../../blockchain/contracts.js";
import { prisma } from "../../db/prisma.js";

export async function startAmmListener(provider) {
     const poolAddress = process.env.AMM_POOL_ADDRESS;

     if (!poolAddress) {
          console.error("AMM_POOL_ADDRESS not set in environment");
          return;
     }

     try {
          const pool = getAMMPool(poolAddress);

          console.log(`Listening for Swap events on ${poolAddress}`);

          // Note: Adjust parameters based on actual Swap event signature from your AMMPool contract
          pool.on("Swap", async (user, tokenIn, amountIn, tokenOut, amountOut, event) => {
               try {
                    await prisma.swap.create({
                         data: {
                              id: event.log.transactionHash + "-" + event.log.index,
                              pool: await pool.getAddress(),
                              user,
                              tokenIn,
                              tokenOut,
                              amountIn: amountIn.toString(),
                              amountOut: amountOut.toString(),
                              txHash: event.log.transactionHash,
                              block: event.log.blockNumber,
                              timestamp: new Date()
                         }
                    });
                    console.log(`Indexed Swap: ${user} swapped ${amountIn.toString()} for ${amountOut.toString()}`);
               } catch (error) {
                    console.error("Error indexing Swap event:", error);
               }
          });
     } catch (error) {
          console.error("Error setting up AMM listener:", error);
     }
}
