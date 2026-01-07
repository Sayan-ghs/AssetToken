import express from "express";
import { getFeeConfig, calculateFee } from "../service/fee.service.js";

export const router = express.Router();

// GET /fee/config/:controllerAddress - Get fee configuration from controller
router.get("/config/:controllerAddress", async (req, res) => {
     try {
          const { controllerAddress } = req.params;
          const data = await getFeeConfig(controllerAddress);
          res.json(data);
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});

// POST /fee/calculate - Calculate fee based on amount and fee basis points
router.post("/calculate", async (req, res) => {
     try {
          const { amount, feeBps } = req.body;

          if (!amount || feeBps === undefined) {
               return res.status(400).json({
                    error: "amount and feeBps are required"
               });
          }

          const fee = calculateFee(amount, feeBps);
          res.json({
               amount,
               feeBps,
               fee: fee.toString()
          });
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});
