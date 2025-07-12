import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AgreementDocument } from "../models/AgreementDocument.model.js";
import mongoose from "mongoose";
import {uploadOnCloudinary, removeFromCloudinary} from "../utils/cloudinary.js";

const createAgreementDocument = asyncHandler(async (req, res) => {
    const { artisanID, dateSigned, validUntil } = req.body;

    if (!artisanID || !dateSigned) {
        throw new ApiError(400, "Artisan ID and signed date are required");
    }

    if (!mongoose.Types.ObjectId.isValid(artisanID)) {
        throw new ApiError(400, "Invalid Artisan ID format");
    }

    const agreementFileLocalPath = req.file?.path;
    if (!agreementFileLocalPath) {
        throw new ApiError(400, "Agreement file is required");
    }
    
    const agreementFile = await uploadOnCloudinary(agreementFileLocalPath);
    if (!agreementFile?.url) {
        throw new ApiError(500, "Error while uploading agreement file to Cloudinary");
    }

    const document = await AgreementDocument.create({
        artisanID,
        filePath: agreementFile.url,
        filePathPublicId: agreementFile.public_id,
        dateSigned,
        validUntil
    });

    if (!document) {
        throw new ApiError(500, "Failed to create the agreement document in the database");
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

const deleteAgreementDocument = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        throw new ApiError(400, "Invalid Agreement Document ID format");
    }

    const document = await AgreementDocument.findByIdAndDelete(documentId);

    if (!document) {
        throw new ApiError(404, "Agreement document not found");
    }

    if (document.filePathPublicId) {
        await removeFromCloudinary(document.filePathPublicId);
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Agreement document deleted successfully")
    );
});

export { 
    createAgreementDocument, 
    getAllAgreementDocument,
    deleteAgreementDocument,
};