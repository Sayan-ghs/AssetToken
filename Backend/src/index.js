import app from "./app.js";
import { ENV } from "./config/env.js";

app.listen(ENV.PORT, ()=>{
     console.log(`Backend Server Running on Port ${ENV.PORT}`)
})
