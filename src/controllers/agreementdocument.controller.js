import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AgreementDocument } from "../models/AgreementDocument.model.js";
import mongoose from "mongoose";

const createAgreementDocument = asyncHandler(async (req, res) => {
    const { artisanID, filePath, dateSigned, validUntil } = req.body;

    if (!artisanID || !filePath || !dateSigned) {
        throw new ApiError(400, "Artisan ID, file path, and signed date are required");
    }

    if (!mongoose.Types.ObjectId.isValid(artisanID)) {
        throw new ApiError(400, "Invalid Artisan ID format");
    }

    const document = await AgreementDocument.create({
        artisanID,
        filePath,
        dateSigned,
        validUntil
    });

    if (!document) {
        throw new ApiError(500, "Failed to create the agreement document");
    }

    return res.status(201).json(
        new ApiResponse(201, document, "Agreement document created successfully")
    );
});

const getAllAgreementDocument = asyncHandler(async (req, res) => {
    const documents = await AgreementDocument.find({}).populate("artisanID", "name contactNumber");

    return res.status(200).json(
        new ApiResponse(200, { count: documents.length, documents }, "Agreement documents retrieved successfully")
    );
});

const getAgreementDocumentById = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        throw new ApiError(400, "Invalid Agreement Document ID format");
    }

    const document = await AgreementDocument.findById(documentId).populate("artisanID", "name");

    if (!document) {
        throw new ApiError(404, "Agreement document not found");
    }

    return res.status(200).json(
        new ApiResponse(200, document, "Agreement document fetched successfully")
    );
});

const updateAgreementDocument = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { filePath, dateSigned, validUntil } = req.body;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        throw new ApiError(400, "Invalid Agreement Document ID format");
    }
    
    if (!filePath && !dateSigned && !validUntil) {
        throw new ApiError(400, "At least one field to update must be provided.");
    }

    const document = await AgreementDocument.findByIdAndUpdate(
        documentId,
        {
            $set: {
                ...(filePath && { filePath }),
                ...(dateSigned && { dateSigned }),
                ...(validUntil && { validUntil })
            }
        },
        { new: true }
    );

    if (!document) {
        throw new ApiError(404, "Agreement document not found");
    }

    return res.status(200).json(
        new ApiResponse(200, document, "Agreement document updated successfully")
    );
});

const deleteAgreementDocument = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        throw new ApiError(400, "Invalid Agreement Document ID format");
    }

    const document = await AgreementDocument.findByIdAndDelete(documentId);

    if (!document) {
        throw new ApiError(404, "Agreement document not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Agreement document deleted successfully")
    );
});

export { 
    createAgreementDocument, 
    getAllAgreementDocument,
    getAgreementDocumentById,
    updateAgreementDocument,
    deleteAgreementDocument
};