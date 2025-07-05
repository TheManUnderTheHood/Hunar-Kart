import { Router } from "express";
import { 
    createSale, 
    getAllSale,
    getSaleById,
    deleteSale
} from "../controllers/sales.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createSale)
    .get(getAllSale);

router.route("/:saleId")
    .get(getSaleById)
    .delete(deleteSale); 

export default router;