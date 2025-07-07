import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // <-- ADD THIS
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

//Routes Import
import artisanRouter from "./routes/artisan.routes.js";
import adminoperatorRouter from "./routes/adminoperator.routes.js";
import agreementdocumentRouter from "./routes/agreementdocument.routes.js";
import salesRouter from "./routes/sales.routes.js";
import handcrafteditemRouter from "./routes/handcrafteditem.routes.js";
import platformlistingRouter from "./routes/platformlisting.routes.js";

const app = express();

// --- Middleware ---
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser()); // <-- ADD THIS

// --- Route Declaration ---
app.get("/", (req, res) => {
    res.send(`<h1>Hunar Kart API</h1>
        <p><a href="/api/v1/artisans">View Artisans API</a></p>
        <p><a href="/api/v1/adminoperator">View Admin Operators API</a></p>
        <p><a href="/api/v1/agreementdocument">View Agreement Document API</a></p>
        <p><a href="/api/v1/sales">View Sales API</a></p>
        <p><a href="/api/v1/handcrafteditem">View Handcrafted Items API</a></p>
        <p><a href="/api/v1/platformlisting">View Platform Listing API</a></p>
        `);
});

app.use("/api/v1/adminoperator", adminoperatorRouter);
app.use("/api/v1/artisans", artisanRouter);
app.use("/api/v1/agreementdocument", agreementdocumentRouter);
app.use("/api/v1/sales", salesRouter);
app.use("/api/v1/handcrafteditem", handcrafteditemRouter);
app.use("/api/v1/platformlisting", platformlistingRouter);

// Simple health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.use(errorHandler);//global error handler

export { app };
