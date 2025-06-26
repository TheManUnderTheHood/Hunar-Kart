import { AgreementDocument } from "../models/AgreementDocument.js";

const createAgreementDocument = async (req, res) => {
    try {
        const agreementdocument = await agreementdocument.create(req.body);
        res.status(201).json({ success: true, data: platformlisting });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllAgreementDocument = async (req, res) => {
    try {
        const agreementdocument = await AgreementDocument.find({});
        res.status(200).json({ success: true, count: agreementdocument.length, data: agreementdocument });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { createAgreementDocument, getAllAgreementDocument };