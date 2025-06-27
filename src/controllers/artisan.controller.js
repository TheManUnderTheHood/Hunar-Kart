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
        aadhaarCardNumber,
    });

    if (!artisan) {
        throw new ApiError(500, "Something went wrong while creating the artisan");
    }

    return res.status(201).json(
        new ApiResponse(201, artisan, "Artisan created successfully")
    );
});

const getAllArtisans = asyncHandler(async (req, res) => {
    const artisans = await Artisan.find({});

    return res.status(200).json(
        new ApiResponse(200, { count: artisans.length, artisans }, "Artisans retrieved successfully")
    );
});

export { createArtisan, getAllArtisans };