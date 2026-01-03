import { getFeeController } from "../blockchain/contracts.js";

export async function getFeeConfig(controllerAddress) {
  const controller = getFeeController(controllerAddress);

  return {
    primarySaleFee: (await controller.primarySaleFee()).toString(),
    ammSwapFee: (await controller.ammSwapFee()).toString(),
    liquidityFee: (await controller.liquidityFee()).toString(),
    feeRecipient: await controller.feeRecipient()
  };
}

export function calculateFee(amount, feeBps) {
  return (BigInt(amount) * BigInt(feeBps)) / 10_000n;
}
