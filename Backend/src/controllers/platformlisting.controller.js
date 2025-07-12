import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PlatformListing } from "../models/PlatformListing.model.js";
import mongoose from "mongoose";

const createPlatformListing = asyncHandler(async (req, res) => {
    const { itemID, platformName, listingURL, status } = req.body;

    if (!itemID || !platformName) {
        throw new ApiError(400, "Item ID and platform name are required");
    }

    if (!mongoose.Types.ObjectId.isValid(itemID)) {
        throw new ApiError(400, "Invalid Item ID format");
    }

    const listing = await PlatformListing.create({
        itemID,
        platformName,
        listingURL,
        status,
    });

    if (!listing) {
        throw new ApiError(500, "Failed to create the platform listing");
    }

    return res.status(201).json(
        new ApiResponse(201, listing, "Platform listing created successfully")
    );
});

const getAllPlatformListing = asyncHandler(async (req, res) => {
    const listings = await PlatformListing.find({}).populate("itemID", "name price");

    return res.status(200).json(
        new ApiResponse(200, { count: listings.length, listings }, "Platform listings retrieved successfully")
    );
});

const updatePlatformListing = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    const { platformName, listingURL, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
        throw new ApiError(400, "Invalid Platform Listing ID format");
    }
    
    if (!platformName && !listingURL && !status) {
        throw new ApiError(400, "At least one field to update must be provided.");
    }

    const listing = await PlatformListing.findByIdAndUpdate(
        listingId,
        {
            $set: {
                ...(platformName && { platformName }),
                ...(listingURL && { listingURL }),
                ...(status && { status })
            }
        },
        { new: true }
    );

    if (!listing) {
        throw new ApiError(404, "Platform listing not found");
    }

    return res.status(200).json(
        new ApiResponse(200, listing, "Platform listing updated successfully")
    );
});

const deletePlatformListing = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
        throw new ApiError(400, "Invalid Platform Listing ID format");
    }

    const listing = await PlatformListing.findByIdAndDelete(listingId);

    if (!listing) {
        throw new ApiError(404, "Platform listing not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Platform listing deleted successfully")
    );
});

export { 
    createPlatformListing, 
    getAllPlatformListing,
    updatePlatformListing,
    deletePlatformListing 
};