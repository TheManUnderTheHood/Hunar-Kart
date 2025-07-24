// src/controllers/artisan.controller.js

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Artisan } from "../models/Artisan.model.js";
import { HandcraftedItem } from "../models/HandcraftedItem.model.js";
import { AgreementDocument } from "../models/AgreementDocument.model.js";
import { Sale } from "../models/Sales.model.js";
import { PlatformListing } from "../models/PlatformListing.model.js";
import { uploadOnCloudinary, removeFromCloudinary } from "../utils/cloudinary.js"; // Import your utilities
import mongoose from "mongoose";

const createArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, aadhaarCardNumber } = req.body;

    if (!name || !address || !contactNumber) {
        throw new ApiError(400, "Name, address, and contact number are required");
    }

    // Get the local path of the uploaded file from the middleware
    const avatarLocalPath = req.file?.path;
    let avatar;

    if (avatarLocalPath) {
        // Upload the file to Cloudinary using your utility
        avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new ApiError(500, "Error while uploading avatar to cloud service.");
        }
    }

    const artisan = await Artisan.create({
        name,
        address,
        contactNumber,
        aadhaarCardNumber,
        avatar: avatar?.url || "",
        avatarPublicId: avatar?.public_id || ""
    });

    if (!artisan) {
        // If DB save fails, remove the file that was just uploaded to Cloudinary
        if (avatar) {
            await removeFromCloudinary(avatar.public_id);
        }
        throw new ApiError(500, "Failed to create the artisan in the database");
    }

    return res.status(201).json(
        new ApiResponse(201, artisan, "Artisan created successfully")
    );
});

const updateArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, agreementStatus } = req.body;
    const { artisanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID");
    }

    const existingArtisan = await Artisan.findById(artisanId);
    if (!existingArtisan) {
        throw new ApiError(404, "Artisan not found");
    }

    const updateData = {
        ...(name && { name }),
        ...(address && { address }),
        ...(contactNumber && { contactNumber }),
        ...(agreementStatus && { agreementStatus })
    };
    
    // Check if a new avatar file was uploaded
    if (req.file) {
        const avatarLocalPath = req.file.path;
        const newAvatar = await uploadOnCloudinary(avatarLocalPath);

        if (!newAvatar) {
            throw new ApiError(500, "Error while uploading new avatar.");
        }

        updateData.avatar = newAvatar.url;
        updateData.avatarPublicId = newAvatar.public_id;

        // If an old avatar existed, remove it from Cloudinary
        if (existingArtisan.avatarPublicId) {
            await removeFromCloudinary(existingArtisan.avatarPublicId);
        }
    }

    const artisan = await Artisan.findByIdAndUpdate(
        artisanId,
        { $set: updateData },
        { new: true } 
    );

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

        // --- CLOUDINARY DELETION LOGIC ---
        // If an avatar exists, remove it
        if (artisan.avatarPublicId) {
            await removeFromCloudinary(artisan.avatarPublicId);
        }
        
        // Your existing excellent transaction logic...
        const agreements = await AgreementDocument.find({ artisanID: artisanId }).session(session);
        if (agreements.length > 0) {
            const publicIds = agreements.map(doc => doc.filePathPublicId).filter(id => id);
            if (publicIds.length > 0) {
                await Promise.all(publicIds.map(id => removeFromCloudinary(id))); 
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

// --- NO CHANGES NEEDED FOR THE FOLLOWING FUNCTIONS ---
const getAllArtisans = asyncHandler(async (req, res) => {
    const artisans = await Artisan.find({}).sort({ createdAt: -1 });

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

const getArtisanSales = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID");
    }
    const sales = await Sale.find({ artisanID: artisanId })
        .populate("itemID", "name price")
        .sort({ date: -1 });
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalRevenue, 0);
    return res.status(200).json(
        new ApiResponse(
            200, 
            { count: sales.length, totalRevenue, sales }, 
            "Artisan sales data fetched successfully"
        )
    );
});


export { 
    createArtisan, 
    getAllArtisans, 
    getArtisanById, 
    updateArtisan, 
    deleteArtisan,
    getArtisanSales 
};