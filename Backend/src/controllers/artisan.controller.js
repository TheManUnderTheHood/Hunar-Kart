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

    // --- AVATAR UPLOAD LOGIC ---
    const avatarPath = req.file?.path;
    const avatarPublicId = req.file?.filename; // The filename is the public_id from multer-storage-cloudinary

    const artisan = await Artisan.create({
        name,
        address,
        contactNumber,
        aadhaarCardNumber,
        avatar: avatarPath,
        avatarPublicId: avatarPublicId
    });

    if (!artisan) {
        // If artisan creation fails, remove the uploaded file from Cloudinary
        if (avatarPublicId) {
            await removeFromCloudinary(avatarPublicId);
        }
        throw new ApiError(500, "Failed to create the artisan");
    }

    return res.status(201).json(
        new ApiResponse(201, artisan, "Artisan created successfully")
    );
});

const getAllArtisans = asyncHandler(async (req, res) => {
    // Added sorting by creation date to show newest first
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

const updateArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, aadhaarCardNumber } = req.body;
    const { artisanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID");
    }

    // Find the existing artisan to get old avatar info
    const existingArtisan = await Artisan.findById(artisanId);
    if (!existingArtisan) {
        throw new ApiError(404, "Artisan not found");
    }

    const updateData = {
        ...(name && { name }),
        ...(address && { address }),
        ...(contactNumber && { contactNumber }),
        ...(aadhaarCardNumber && { aadhaarCardNumber }),
    };

    // --- AVATAR UPDATE LOGIC ---
    if (req.file) {
        // A new file is uploaded, set the new avatar path and public_id
        updateData.avatar = req.file.path;
        updateData.avatarPublicId = req.file.filename;

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

    if (!artisan) {
        throw new ApiError(404, "Artisan not found during update");
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

        // --- AVATAR DELETION LOGIC ---
        // If an avatar exists, remove it from Cloudinary
        if (artisan.avatarPublicId) {
            await removeFromCloudinary(artisan.avatarPublicId);
        }

        // The rest of your existing, excellent transaction logic remains
        const agreements = await AgreementDocument.find({ artisanID: artisanId }).session(session);
        if (agreements.length > 0) {
            const publicIds = agreements.map(doc => doc.filePathPublicId).filter(id => id);
            if (publicIds.length > 0) {
                // Corrected the Promise.all usage
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
        console.error("Artisan Deletion Error: ", error); // Added for better debugging
        throw new ApiError(
            error.statusCode || 500, 
            error.message || "An error occurred while deleting the artisan and related data."
        );

    } finally {
        session.endSession();
    }
});

const getArtisanSales = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
        throw new ApiError(400, "Invalid Artisan ID");
    }

    const sales = await Sale.find({ artisanID: artisanId })
        .populate("itemID", "name price")
        .sort({ date: -1 });

    // This is correct - no need for a !sales check
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