import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Conneted Successfully ✅")
    } catch (error) {
        console.error("mongoDB connection error ❌", error)
        process.exit(1)
    }
}

export default connectDB