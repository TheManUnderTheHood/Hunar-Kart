import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env' // Path relative to where you run `node`
})

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("EXPRESS APP ERROR:", err);
        throw err;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 Server is running on port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed!!!", err);
})