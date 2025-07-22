import { Router } from "express";
import { 
    createArtisan, 
    getAllArtisans,
    getArtisanById,
    updateArtisan,
    deleteArtisan,
    getArtisanSales
} from "../controllers/artisan.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all artisan routes
router.use(verifyJWT);

// Route for /api/v1/artisans
router.route("/")
    .post(createArtisan)
    .get(getAllArtisans);

router.route("/:artisanId/sales").get(getArtisanSales);

// Route for /api/v1/artisans/:artisanId
router.route("/:artisanId")
    .get(getArtisanById)
    .patch(updateArtisan)
    .delete(deleteArtisan);

export default router;