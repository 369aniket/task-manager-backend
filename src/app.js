import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


// basic configration
const app = express()
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser());

// cors configration

app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || "http:\\localhost:5173",
    credentials:true,
    methods:["GET", "PPOST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization"]
}),
);

// Import the routes 
 import healthcheckRouter from "./routes/healthcheck.routs.js"
 import authRouter from "./routes/auth.routs.js";
 app.use("/api/v1/healthcheck", healthcheckRouter)
 app.use("/api/v1/auth", authRouter)

app.get("/", (req, res)=>{
    res.send("hello basecampy")
})

export default app;