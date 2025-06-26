import { Router } from "express";
import { createAgreementDocument, getAllAgreementDocument } from "../controllers/agreementdocument.controller.js";

const router = Router();

router.route("/")
    .post(createAgreementDocument)
    .get(getAllAgreementDocument);

export default router;