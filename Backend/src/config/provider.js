import { JsonRpcProvider } from "ethers"
import { ENV } from "./env.js"

let provider = null

if (ENV.RPC_URL) {
     try {
          provider = new JsonRpcProvider(ENV.RPC_URL)
          console.log(`✓ Connected to RPC: ${ENV.RPC_URL}`)
     } catch (error) {
          console.warn(`⚠ Failed to connect to RPC: ${error.message}`)
     }
} else {
     console.warn('⚠ RPC_URL not configured - blockchain features will be unavailable')
     console.warn('  To fix: Set RPC_URL in your .env file (e.g., https://sepolia.infura.io/v3/YOUR-KEY)')
}

export default provider

