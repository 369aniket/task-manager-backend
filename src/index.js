
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/database.js";

dotenv.config();

const port = process.env.PORT || 8000;

connectDB()
.then(()=>{
    app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
})
.catch((error)=>{
    console.error("MongoDB Connection Error",error)
    process.exit(1)
})