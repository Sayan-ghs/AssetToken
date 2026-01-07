import { getAssetToken } from "../../blockchain/contracts.js";
import { prisma } from "../../db/prisma.js";

export async function startAssetTokenListener(provider) {
     const tokenAddress = process.env.ASSET_TOKEN_ADDRESS;

     if (!tokenAddress) {
          console.error("ASSET_TOKEN_ADDRESS not set in environment");
          return;
     }

     try {
          const token = getAssetToken(tokenAddress);

          console.log(`Listening for Transfer events on ${tokenAddress}`);

          token.on("Transfer", async (from, to, amount, event) => {
               try {
                    await prisma.transfer.create({
                         data: {
                              id: event.log.transactionHash + "-" + event.log.index,
                              token: await token.getAddress(),
                              from,
                              to,
                              amount: amount.toString(),
                              txHash: event.log.transactionHash,
                              block: event.log.blockNumber,
                              timestamp: new Date()
                         }
                    });
                    console.log(`Indexed Transfer: ${from} -> ${to}, amount: ${amount.toString()}`);
               } catch (error) {
                    console.error("Error indexing Transfer event:", error);
               }
          });
     } catch (error) {
          console.error("Error setting up AssetToken listener:", error);
     }
}
