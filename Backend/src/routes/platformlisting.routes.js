import { Router } from "express";
import { 
    createPlatformListing, 
    getAllPlatformListing,
    updatePlatformListing,
    deletePlatformListing
} from "../controllers/platformlisting.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createPlatformListing)
    .get(getAllPlatformListing);

router.route("/:listingId")
    .patch(updatePlatformListing)
    .delete(deletePlatformListing);

export default router;