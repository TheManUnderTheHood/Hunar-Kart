import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
import fs from "fs"; 

dotenv.config({
    path: './.env' 
})

const tempDir = './public/temp'; //if does not exist then will create
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("EXPRESS APP ERROR:", err);
        throw err;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed!!!", err);
})