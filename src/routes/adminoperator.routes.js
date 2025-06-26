import { Router } from "express";
import { createAdminOperator, getAllAdminOperator } from "../controllers/adminOperator.controller.js";

const router = Router();

router.route("/")
    .post(createAdminOperator)
    .get(getAllAdminOperator);

export default router;