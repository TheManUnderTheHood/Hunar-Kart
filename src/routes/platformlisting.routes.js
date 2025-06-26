import { Router } from "express";
import { createPlatformListing, getAllPlatformListing } from "../controllers/platformlisting.controller.js";

const router = Router();

router.route("/")
    .post(createPlatformListing)
    .get(getAllPlatformListing);

export default router;