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
import { upload } from '../utils/cloudinary.js';

const router = Router();

// Protect all artisan routes
router.use(verifyJWT);

// Route for /api/v1/artisans
router.route("/")
    .post(upload.single('avatar'), createArtisan)
    .get(getAllArtisans);

router.route("/:artisanId/sales").get(getArtisanSales);

// Route for /api/v1/artisans/:artisanId
router.route("/:artisanId")
    .get(getArtisanById)
    .patch(upload.single('avatar'), updateArtisan)
    .delete(deleteArtisan);

export default router;