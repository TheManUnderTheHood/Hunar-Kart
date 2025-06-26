import { Router } from "express";
import { createArtisan, getAllArtisans } from "../controllers/artisan.controller.js";

const router = Router();

// Route for /api/v1/artisans
router.route("/")
    .post(createArtisan)
    .get(getAllArtisans);

export default router;