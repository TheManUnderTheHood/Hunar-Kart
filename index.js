import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express"

dotenv.config({
    path: './env'
})

const app = new express()

app.get("/", (req, res) => {
    res.send("Hunar Kart");
})

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("ERROR:", err);
    })
    app.listen(process.env.PORT, () => {
        console.log(`Server running on ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed!!!", err);
})