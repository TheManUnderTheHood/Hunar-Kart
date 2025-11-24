
import { Router } from "express";
import { 
    createSale, 
    getAllSale,
    deleteSale
} from "../controllers/sales.controller.js";
import { verifyJWT, authorizeRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createSale)
    .get(getAllSale);

router.route("/:saleId")
    .delete(authorizeRole("Admin"), deleteSale); // Only Admins can delete sales

export default router;
