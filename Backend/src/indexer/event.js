import { getPrimarySale } from "../blockchain/contracts.js"

export function startIndexing({ sale, amm }) {
  sale.on("TokensPurchased", (buyer, amount, paid) => {
    console.log("SALE:", buyer, amount.toString(), paid.toString());
  });

  amm.on("Swap", (user, amountIn, amountOut) => {
    console.log("SWAP:", user, amountIn.toString(), amountOut.toString());
  });
}
