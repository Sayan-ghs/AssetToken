import { ethers } from "ethers";
import { getPrimarySale } from "../../blockchain/contracts.js";
import { prisma } from "../../db/prisma.js";

export async function startPrimarySaleListener(provider) {
     const saleAddress = process.env.PRIMARY_SALE_ADDRESS;

     if (!saleAddress) {
          console.error("PRIMARY_SALE_ADDRESS not set in environment");
          return;
     }

     try {
          const sale = getPrimarySale(saleAddress);

          console.log(`Listening for TokensPurchased events on ${saleAddress}`);

          // Correct event name from the PrimarySale contract
          sale.on("TokensPurchased", async (token, buyer, amount, totalCost, event) => {
               try {
                    await prisma.primarySale.create({
                         data: {
                              id: event.log.transactionHash + "-" + event.log.index,
                              token,
                              buyer,
                              amount: amount.toString(),
                              totalCost: totalCost.toString(),
                              txHash: event.log.transactionHash,
                              block: event.log.blockNumber,
                              timestamp: new Date()
                         }
                    });
                    console.log(`Indexed TokensPurchased: ${buyer} bought ${amount.toString()} tokens`);
               } catch (error) {
                    console.error("Error indexing TokensPurchased event:", error);
               }
          });
     } catch (error) {
          console.error("Error setting up PrimarySale listener:", error);
     }
}
