import { Router } from "express";
import { 
    registerAdminOperator, 
    loginAdminOperator, 
    logoutAdminOperator,
    getAllAdminOperator,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
} from "../controllers/adminOperator.controller.js";
import { verifyJWT, authorizeRole } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// --- Public Routes ---
router.route("/login").post(loginAdminOperator);
router.route("/refresh-token").post(refreshAccessToken);

// --- Secured Routes ---

router.route("/register").post(
    //authorizeRole("Admin"), // Only Admins can register new users
    upload.fields([{ name: "avatar", maxCount: 1 }]), 
    registerAdminOperator
);
router.use(verifyJWT); 

router.route("/").get(authorizeRole("Admin"), getAllAdminOperator);

router.route("/logout").post(logoutAdminOperator);
router.route("/current-user").get(getCurrentUser);
router.route("/update-account").patch(updateAccountDetails);
router.route("/update-avatar").patch(upload.single("avatar"), updateUserAvatar);

export default router;