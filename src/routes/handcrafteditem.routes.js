import { Router } from "express";
import { 
    createHandcraftedItem, 
    getAllHandcraftedItem,
    getHandcraftedItemById,
    updateHandcraftedItem,
    deleteHandcraftedItem
} from "../controllers/handcrafteditem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.route("/")
    .post(createHandcraftedItem)
    .get(getAllHandcraftedItem);

router.route("/:itemId")
    .get(getHandcraftedItemById)
    .patch(updateHandcraftedItem)
    .delete(deleteHandcraftedItem);

export default router;