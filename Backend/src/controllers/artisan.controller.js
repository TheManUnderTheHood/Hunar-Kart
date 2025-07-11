import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Artisan } from "../models/Artisan.model.js";
import { HandcraftedItem } from "../models/HandcraftedItem.model.js";
import { AgreementDocument } from "../models/AgreementDocument.model.js";
import { Sale } from "../models/Sales.model.js";
import { PlatformListing } from "../models/PlatformListing.model.js";
import { removeFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const createArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, aadhaarCardNumber } = req.body;

    if (!name || !address || !contactNumber) {
        throw new ApiError(400, "Name, address, and contact number are required");
    }

    const artisan = await Artisan.create({
        name,
        address,
        contactNumber,
        aadhaarCardNumber
    });

    if (!artisan) {
        throw new ApiError(500, "Failed to create the artisan");
    }

    return res.status(201).json(
        new ApiResponse(201, artisan, "Artisan created successfully")
    );
});

const getAllArtisans = asyncHandler(async (req, res) => {
    const artisans = await Artisan.find({});

    return res.status(200).json(
        new ApiResponse(200, { count: artisans.length, artisans: artisans }, "Artisans retrieved successfully")
    );
});

const getArtisanById = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID format");
    }

    const artisan = await Artisan.findById(artisanId);

    if (!artisan) {
        throw new ApiError(404, "Artisan not found");
    }

    return res.status(200).json(
        new ApiResponse(200, artisan, "Artisan fetched successfully")
    );
});

const updateArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, agreementStatus } = req.body;
    const { artisanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID");
    }

    const artisan = await Artisan.findByIdAndUpdate(
        artisanId,
        {
            $set: {
                ...(name && { name }),
                ...(address && { address }),
                ...(contactNumber && { contactNumber }),
                ...(agreementStatus && { agreementStatus })
            }
        },
        { new: true } 
    );

    if (!artisan) {
        throw new ApiError(404, "Artisan not found");
    }

    return res.status(200).json(
        new ApiResponse(200, artisan, "Artisan updated successfully")
    );
});

const deleteArtisan = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID");
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const artisan = await Artisan.findById(artisanId).session(session);
        if (!artisan) {
            throw new ApiError(404, "Artisan not found");
        }

        const agreements = await AgreementDocument.find({ artisanID: artisanId }).session(session);
        if (agreements.length > 0) {

            const publicIds = agreements.map(doc => doc.filePathPublicId).filter(id => id);
            if (publicIds.length > 0) {
                await Promise.all(publicIds.forEach(id => removeFromCloudinary(id))); 
            }

            await AgreementDocument.deleteMany({ artisanID: artisanId }).session(session);
        }

        const items = await HandcraftedItem.find({ artisanID: artisanId }).select('_id').session(session);
        const itemIds = items.map(item => item._id);

        if (itemIds.length > 0) {

            await PlatformListing.deleteMany({ itemID: { $in: itemIds } }).session(session);

            await HandcraftedItem.deleteMany({ artisanID: artisanId }).session(session);
        }

        await Sale.deleteMany({ artisanID: artisanId }).session(session);

        await Artisan.findByIdAndDelete(artisanId).session(session);

        await session.commitTransaction();
        
        return res.status(200).json(
            new ApiResponse(200, {}, "Artisan and all related data deleted successfully")
        );

    } catch (error) {
        await session.abortTransaction();

        throw new ApiError(
            error.statusCode || 500, 
            error.message || "An error occurred while deleting the artisan and related data."
        );

    } finally {
        session.endSession();
    }
});

export { createArtisan, getAllArtisans, getArtisanById, updateArtisan, deleteArtisan };