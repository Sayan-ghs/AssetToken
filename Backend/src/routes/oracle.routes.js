import express from "express";
import { getOraclePrice, getOracleData } from "../service/oracle.service.js";

export const router = express.Router();

// GET /oracle/:oracleAddress/price - Get price from oracle
router.get("/:oracleAddress/price", async (req, res) => {
     try {
          const { oracleAddress } = req.params;
          const data = await getOraclePrice(oracleAddress);
          res.json(data);
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});

// GET /oracle/:oracleAddress/data - Get full oracle data
router.get("/:oracleAddress/data", async (req, res) => {
     try {
          const { oracleAddress } = req.params;
          const data = await getOracleData(oracleAddress);
          res.json(data);
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});
