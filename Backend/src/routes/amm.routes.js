import express from "express";
import { getPoolState, simulateSwap } from "../service/amm.service.js";

export const router = express.Router();

// GET /amm/pool/:poolAddress - Get AMM pool state (reserves and liquidity)
router.get("/pool/:poolAddress", async (req, res) => {
     try {
          const { poolAddress } = req.params;
          const data = await getPoolState(poolAddress);
          res.json(data);
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});

// POST /amm/simulate-swap - Simulate a swap to get expected output
router.post("/simulate-swap", async (req, res) => {
     try {
          const { amountIn, reserveIn, reserveOut, feeBps } = req.body;

          if (!amountIn || !reserveIn || !reserveOut || feeBps === undefined) {
               return res.status(400).json({
                    error: "amountIn, reserveIn, reserveOut, and feeBps are required"
               });
          }

          const amountOut = simulateSwap(amountIn, reserveIn, reserveOut, feeBps);
          res.json({
               amountIn,
               reserveIn,
               reserveOut,
               feeBps,
               amountOut: amountOut.toString()
          });
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});
