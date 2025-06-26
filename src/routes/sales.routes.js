import { Router } from "express";
import { createSale, getAllSale } from "../controllers/sales.controller.js";

const router = Router();

router.route("/")
    .post(createSale)
    .get(getAllSale);

export default router;