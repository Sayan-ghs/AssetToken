import express from "express";
import { router as tokenRouter } from "./routes/token.routes.js";
import { router as saleRouter } from "./routes/sale.routes.js";
import { router as ammRouter } from "./routes/amm.routes.js";
import { router as reserveRouter } from "./routes/reserve.routes.js";
import { router as feeRouter } from "./routes/fee.routes.js";
import { router as oracleRouter } from "./routes/oracle.routes.js";
import cors from "cors";
import { config } from "dotenv";

config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
     res.send("Backend Server Running on Port " + process.env.PORT);
});

// Register all routes
app.use("/token", tokenRouter);
app.use("/sale", saleRouter);
app.use("/amm", ammRouter);
app.use("/reserve", reserveRouter);
app.use("/fee", feeRouter);
app.use("/oracle", oracleRouter);

export default app;
