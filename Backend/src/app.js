import express from "express";
import { router } from "./routes/token.routes.js";
import cors from "cors";
import { config } from "dotenv";

config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/token",router);

export default app;