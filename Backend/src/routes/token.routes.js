import express from "express";
import { getTokenInfo } from "../service/token.service.js";

export const router = express.Router();

router.get("/:token/:user",async(req,res)=>{
     try{
          const {token,user} = req.params;
          const data = await getTokenInfo(token,user);
          res.json(data)
     }catch(e){
          res.status(500).json({
               error:e.message
          })
     }
})