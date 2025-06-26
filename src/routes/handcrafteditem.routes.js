import { Router } from "express";
import { createHandcraftedItem, getAllHandcraftedItem } from "../controllers/handcrafteditem.controller.js";

const router = Router();

router.route("/")
    .post(createHandcraftedItem)
    .get(getAllHandcraftedItem);

export default router;