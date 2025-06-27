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
    // We use .populate() to fetch the details of the Artisan referenced by artisanID
    // This demonstrates the power of your database interlinking.
    const documents = await AgreementDocument.find({}).populate("artisanID", "name contactNumber");

    return res.status(200).json(
        new ApiResponse(200, { count: documents.length, documents }, "Agreement documents retrieved successfully")
    );
});

export { createAgreementDocument, getAllAgreementDocument };