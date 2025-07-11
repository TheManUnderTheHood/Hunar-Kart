import { Router } from "express";
import { 
    createAgreementDocument, 
    getAllAgreementDocument,
    getAgreementDocumentById,
    deleteAgreementDocument
} from "../controllers/agreementdocument.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(upload.single("agreementFile"), createAgreementDocument) 
    .get(getAllAgreementDocument);

router.route("/:documentId")
    .get(getAgreementDocumentById)
    .delete(deleteAgreementDocument);

export default router;