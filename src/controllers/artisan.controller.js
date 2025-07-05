import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Artisan } from "../models/Artisan.model.js";
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

    const artisan = await Artisan.findByIdAndDelete(artisanId);

    if (!artisan) {
        throw new ApiError(404, "Artisan not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Artisan deleted successfully")
    );
});

export { createArtisan, getAllArtisans, getArtisanById, updateArtisan, deleteArtisan };