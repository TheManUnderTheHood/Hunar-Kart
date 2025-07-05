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
    const items = await HandcraftedItem.find({}).populate("artisanID", "name");

    return res.status(200).json(
        new ApiResponse(200, { count: items.length, items }, "Handcrafted items retrieved successfully")
    );
});

const getHandcraftedItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        throw new ApiError(400, "Invalid Handcrafted Item ID format");
    }

    const item = await HandcraftedItem.findById(itemId).populate("artisanID", "name");

    if (!item) {
        throw new ApiError(404, "Handcrafted item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Handcrafted item fetched successfully")
    );
});

const updateHandcraftedItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { name, description, category, price, quantity, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        throw new ApiError(400, "Invalid Handcrafted Item ID format");
    }
    
    if (!name && !description && !category && !price && !quantity && !status) {
        throw new ApiError(400, "At least one field must be provided for update.");
    }

    const item = await HandcraftedItem.findByIdAndUpdate(
        itemId,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
                ...(category && { category }),
                ...(price && { price }),
                ...(quantity && { quantity }),
                ...(status && { status })
            }
        },
        { new: true }
    );

    if (!item) {
        throw new ApiError(404, "Handcrafted item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Handcrafted item updated successfully")
    );
});

const deleteHandcraftedItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        throw new ApiError(400, "Invalid Handcrafted Item ID format");
    }

    const item = await HandcraftedItem.findByIdAndDelete(itemId);

    if (!item) {
        throw new ApiError(404, "Handcrafted item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Handcrafted item deleted successfully")
    );
});

export { 
    createHandcraftedItem, 
    getAllHandcraftedItem,
    getHandcraftedItemById,
    updateHandcraftedItem,
    deleteHandcraftedItem 
};