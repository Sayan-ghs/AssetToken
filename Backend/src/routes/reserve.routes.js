import express from "express";
import { verifyReserve } from "../service/reserve.service.js";

export const router = express.Router();

// GET /reserve/verify/:contractAddress/:token - Verify proof of reserve for a token
router.get("/verify/:contractAddress/:token", async (req, res) => {
     try {
          const { contractAddress, token } = req.params;
          const data = await verifyReserve(contractAddress, token);
          res.json(data);
     } catch (e) {
          res.status(500).json({
               error: e.message
          });
     }
});
