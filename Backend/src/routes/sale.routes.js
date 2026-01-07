import express from "express";
import { getSaleDetails, calculateSaleCost } from "../service/sale.service.js";

export const router = express.Router();

// GET /sale/:saleAddress/:tokenAddress - Get sale details for a specific token
router.get("/:saleAddress/:tokenAddress", async (req, res) => {
     try {
          const { saleAddress, tokenAddress } = req.params;
          const data = await getSaleDetails(saleAddress, tokenAddress);
          res.json(data);
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});

// POST /sale/calculate-cost - Calculate the cost for buying tokens
router.post("/calculate-cost", async (req, res) => {
     try {
          const { pricePerToken, amount } = req.body;

          if (!pricePerToken || !amount) {
               return res.status(400).json({
                    error: "pricePerToken and amount are required"
               });
          }

          const cost = calculateSaleCost(pricePerToken, amount);
          res.json({
               pricePerToken,
               amount,
               totalCost: cost.toString()
          });
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});
