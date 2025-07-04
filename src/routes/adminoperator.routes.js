import { Router } from "express";
import { 
    registerAdminOperator, 
    loginAdminOperator, 
    logoutAdminOperator,
    getAllAdminOperator 
} from "../controllers/adminOperator.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public Routes
router.route("/register").post(upload.fields([
    { 
        name: "avatar", 
        maxCount: 1
    }]), registerAdminOperator);
router.route("/login").post(loginAdminOperator);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutAdminOperator);
router.route("/").get(verifyJWT, getAllAdminOperator); // Get all operators is now a protected route

export default router;