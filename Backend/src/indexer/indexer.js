import { config } from "dotenv";
import { JsonRpcProvider } from "ethers";
import { startAssetTokenListener } from "./listeners/assetToken.listener.js";
import { startPrimarySaleListener } from "./listeners/primarySale.listener.js";
import { startAmmListener } from "./listeners/amm.listener.js";

// Load environment variables
config();

const provider = new JsonRpcProvider(process.env.RPC_URL);

async function start() {
     console.log("Starting blockchain event indexer...");
     console.log(`Connected to RPC: ${process.env.RPC_URL}`);

     try {
          await startAssetTokenListener(provider);
          await startPrimarySaleListener(provider);
          await startAmmListener(provider);
          console.log("✓ All event listeners started successfully");
          console.log("Indexer is now running and listening for blockchain events...");
     } catch (error) {
          console.error("Error starting indexer:", error);
          process.exit(1);
     }
}

start().catch(console.error);
