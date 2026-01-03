import { createRequire } from "module";
import provider from "../config/provider.js";
import { ethers, getAccountPath } from "ethers";

const require = createRequire(import.meta.url);


const AssetToken = require("../../abi/AssetToken.json");
const AssetTokenABI = AssetToken.abi;
const PrimarySale = require("../../abi/PrimarySale.json");
const PrimarySaleABI = PrimarySale.abi;
const AMMPool = require("../../abi/AMMPool.json");
const AMMPoolABI = AMMPool.abi;
const LPToken = require("../../abi/LPToken.json");
const LPTokenABI = LPToken.abi;
const Oracle = require("../../abi/Oracle.json");
const OracleABI = Oracle.abi;
const ProofOfReserve = require("../../abi/ProofOfReserve.json");
const ProofOfReserveABI = ProofOfReserve.abi;

// const CONTRACT_ADDRESS = process.env.ASSET_TOKEN_ADDRESS;

function getContract(address,abi){
  if(!address) throw new Error ("contract address required")
    return new Contract (address,abi,provider)
}

export function getAssetToken(address) {
  return getContract(address, AssetTokenABI);
}

export function getPrimarySale(address){
  return getContract(address,PrimarySaleABI)
}

export function getAMMPool(address){
  return getContract(address,AMMPoolABI)
}

export function getLPToken(address){
  return getContract(address,LPTokenABI)
}

export function getOracle(address){
  return getContract(address,OracleABI)
}


export function getProofOfReserve(address){
  return getContract(address,ProofOfReserveABI)
}

export function getFeeControler(address){
  return getContract(address,ProofOfReserveABI)
}