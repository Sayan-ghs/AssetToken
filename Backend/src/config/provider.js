import { JsonRpcProvider } from "ethers"
import {ENV} from "./env.js"

const provider = new JsonRpcProvider(ENV.RPC_URL)
export default provider
