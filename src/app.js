import express from "express";
import cors from "cors";

const app = express();

// --- Middleware ---
app.use(cors({
    origin: process.env.CORS_ORIGIN, // You can configure this in .env for security
    credentials: true
}));

app.use(express.json({ limit: "16kb" })); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // To parse URL-encoded data

// --- Routes ---
// Import routers (example for artisan, you'll add more)
import artisanRouter from "./routes/artisan.routes.js";
// import saleRouter from './routes/sale.routes.js'; // etc.

// --- Route Declaration ---
app.get("/", (req, res) => {
    res.send("<h1>Hunar Kart API</h1><p>Use /api/v1/... to access routes.</p>");
});

app.use("/api/v1/artisans", artisanRouter);
// app.use("/api/v1/sales", saleRouter); // etc. for all other routes

// Simple health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});


export { app };