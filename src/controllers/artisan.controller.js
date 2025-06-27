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

// Example of how you would get a single artisan and populate related data
const getArtisanById = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID format");
    }

    // This is where the 'ref' in your models becomes powerful.
    // We can find an artisan and also fetch all HandcraftedItems associated with them.
    const artisan = await Artisan.findById(artisanId);

    if (!artisan) {
        throw new ApiError(404, "Artisan not found");
    }

    // You can also populate related data from other collections like this:
    // const items = await HandcraftedItem.find({ artisanID: artisan._id });

    return res.status(200).json(
        new ApiResponse(200, artisan, "Artisan fetched successfully")
    );
});


export { createArtisan, getAllArtisans, getArtisanById };