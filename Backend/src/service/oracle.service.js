import { getOracle } from "../blockchain/contracts.js";

export async function getOraclePrice(oracleAddress) {
  const oracle = getOracle(oracleAddress);
  const price = await oracle.getLatestPrice();

  return {
    price: price.toString(),
    timestamp: Date.now()
  };
}

export async function getOracleData(oracleAddress) {
  const oracle = getOracle(oracleAddress);
  const [price, decimals, description] = await Promise.all([
    oracle.getLatestPrice(),
    oracle.decimals(),
    oracle.description()
  ]);

  return {
    price: price.toString(),
    decimals: Number(decimals),
    description,
    timestamp: Date.now()
  };
}
