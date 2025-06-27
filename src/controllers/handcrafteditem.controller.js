import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HandcraftedItem } from "../models/HandcraftedItem.model.js";
import mongoose from "mongoose";

const createHandcraftedItem = asyncHandler(async (req, res) => {
    const { artisanID, name, description, category, price, quantity } = req.body;

    if (!artisanID || !name || !price || quantity === undefined) {
        throw new ApiError(400, "Artisan ID, name, price, and quantity are required");
    }

     if (!mongoose.Types.ObjectId.isValid(artisanID)) {
        throw new ApiError(400, "Invalid Artisan ID format");
    }

    const item = await HandcraftedItem.create({
        artisanID,
        name,
        description,
        category,
        price,
        quantity,
    });

    if (!item) {
        throw new ApiError(500, "Failed to create the handcrafted item");
    }

    return res.status(201).json(
        new ApiResponse(201, item, "Handcrafted item created successfully")
    );
});

const getAllHandcraftedItem = asyncHandler(async (req, res) => {
    // Populate with artisan's name to show who created the item
    const items = await HandcraftedItem.find({}).populate("artisanID", "name");

    return res.status(200).json(
        new ApiResponse(200, { count: items.length, items }, "Handcrafted items retrieved successfully")
    );
});

export { createHandcraftedItem, getAllHandcraftedItem };