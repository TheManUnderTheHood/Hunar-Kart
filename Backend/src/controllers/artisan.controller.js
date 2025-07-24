import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Artisan } from "../models/Artisan.model.js";
import { HandcraftedItem } from "../models/HandcraftedItem.model.js";
import { AgreementDocument } from "../models/AgreementDocument.model.js";
import { Sale } from "../models/Sales.model.js";
import { PlatformListing } from "../models/PlatformListing.model.js";
import { uploadOnCloudinary, removeFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

/**
 * @description Creates a new artisan, optionally uploading an avatar.
 */
const createArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, aadhaarCardNumber } = req.body;

    if (!name || !address || !contactNumber) {
        throw new ApiError(400, "Name, address, and contact number are required");
    }

    const avatarLocalPath = req.file?.path;
    let avatarResponse;

    if (avatarLocalPath) {
        avatarResponse = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarResponse) {
            throw new ApiError(500, "Error while uploading avatar to cloud service.");
        }
    }

    const artisan = await Artisan.create({
        name,
        address,
        contactNumber,
        aadhaarCardNumber: aadhaarCardNumber || undefined, // Ensure empty string becomes undefined
        avatar: avatarResponse?.url || "",
        avatarPublicId: avatarResponse?.public_id || ""
    });

    if (!artisan) {
        if (avatarResponse) {
            await removeFromCloudinary(avatarResponse.public_id);
        }
        throw new ApiError(500, "Failed to create the artisan in the database");
    }

    return res.status(201).json(
        new ApiResponse(201, artisan, "Artisan created successfully")
    );
});

/**
 * @description Updates an existing artisan's details, handles new avatar uploads, and cleans up old avatars.
 */
const updateArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, aadhaarCardNumber } = req.body;
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
        // --- FIX: Handle empty string for optional unique field ---
        aadhaarCardNumber: aadhaarCardNumber === '' ? undefined : (aadhaarCardNumber || existingArtisan.aadhaarCardNumber)
    };
    
    if (req.file) {
        const avatarLocalPath = req.file.path;
        const newAvatar = await uploadOnCloudinary(avatarLocalPath);

        if (!newAvatar?.url) {
            throw new ApiError(500, "Error while uploading new avatar.");
        }

        updateData.avatar = newAvatar.url;
        updateData.avatarPublicId = newAvatar.public_id;

        // --- FIX: Add robust check before trying to delete the old avatar ---
        // Only try to remove the old file if a publicId exists and is a non-empty string.
        if (existingArtisan.avatarPublicId && typeof existingArtisan.avatarPublicId === 'string') {
            try {
                await removeFromCloudinary(existingArtisan.avatarPublicId);
            } catch (e) {
                // Log the error but don't crash the server if old file deletion fails
                console.error("Failed to delete old avatar from Cloudinary, but continuing with update:", e.message);
            }
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


/**
 * @description Deletes an artisan and all their related data, including files on Cloudinary.
 */
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

        if (artisan.avatarPublicId) {
            await removeFromCloudinary(artisan.avatarPublicId);
        }
        
        const agreements = await AgreementDocument.find({ artisanID: artisanId }).session(session);
        if (agreements.length > 0) {
            const agreementPublicIds = agreements.map(doc => doc.filePathPublicId).filter(id => id);
            if (agreementPublicIds.length > 0) {
                await Promise.all(agreementPublicIds.map(id => removeFromCloudinary(id))); 
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
        console.error("Artisan Deletion Error:", error);
        throw new ApiError(
            error.statusCode || 500, 
            error.message || "An error occurred while deleting the artisan and related data."
        );
    } finally {
        session.endSession();
    }
});


/**
 * @description Retrieves all artisans, sorted by most recently created.
 */
const getAllArtisans = asyncHandler(async (req, res) => {
    const artisans = await Artisan.find({}).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, { count: artisans.length, artisans: artisans }, "Artisans retrieved successfully")
    );
});

/**
 * @description Retrieves a single artisan by their ID.
 */
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

/**
 * @description Retrieves a list of artisans for public display, without authentication.
 */
const getPublicArtisans = asyncHandler(async (req, res) => {
    const artisans = await Artisan.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("name address avatar craft"); // Only send public-safe data

    if (!artisans) {
        throw new ApiError(404, "Could not find any artisans.");
    }

    return res.status(200).json(
        new ApiResponse(200, { artisans }, "Public artisans fetched successfully")
    );
});

/**
 * @description Retrieves all sales records for a specific artisan.
 */
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
    getArtisanSales,
    getPublicArtisans
};