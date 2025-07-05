import { Router } from "express";
import { 
    createAgreementDocument, 
    getAllAgreementDocument,
    getAgreementDocumentById,
    updateAgreementDocument,
    deleteAgreementDocument
} from "../controllers/agreementdocument.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createAgreementDocument)
    .get(getAllAgreementDocument);

router.route("/:documentId")
    .get(getAgreementDocumentById)
    .patch(updateAgreementDocument)
    .delete(deleteAgreementDocument);

export default router;