import { getProofOfReserve } from "../blockchain/contracts.js";

export async function verifyReserve(contractAddress, token) {
  const por = getProofOfReserve(contractAddress);
  const isValid = await por.verifyReserve(token);

  return {
    token,
    isValid
  };
}
