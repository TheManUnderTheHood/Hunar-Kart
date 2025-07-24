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

// The `createArtisan` function remains the same.
const createArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, aadhaarCardNumber } = req.body;
    if (!name || !address || !contactNumber) throw new ApiError(400, "Name, address, and contact number are required");
    const avatarLocalPath = req.file?.path;
    let avatarResponse;
    if (avatarLocalPath) {
        avatarResponse = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarResponse) throw new ApiError(500, "Avatar upload failed.");
    }
    const artisan = await Artisan.create({
        name, address, contactNumber,
        aadhaarCardNumber: aadhaarCardNumber || undefined,
        avatar: avatarResponse?.url || "",
        avatarPublicId: avatarResponse?.public_id || ""
    });
    if (!artisan) {
        if (avatarResponse) await removeFromCloudinary(avatarResponse.public_id);
        throw new ApiError(500, "Failed to create the artisan in the database");
    }
    return res.status(201).json(new ApiResponse(201, artisan, "Artisan created successfully"));
});

const updateArtisan = asyncHandler(async (req, res) => {
    const { name, address, contactNumber, aadhaarCardNumber } = req.body;
    const { artisanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artisanId)) throw new ApiError(400, "Invalid Artisan ID");

    const artisanToUpdate = await Artisan.findById(artisanId);
    if (!artisanToUpdate) throw new ApiError(404, "Artisan not found");
    
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (aadhaarCardNumber === '' || aadhaarCardNumber) {
         updateData.aadhaarCardNumber = aadhaarCardNumber || undefined;
    }

    if (req.file) {
        const newAvatar = await uploadOnCloudinary(req.file.path);
        if (!newAvatar?.url) throw new ApiError(500, "New avatar upload failed.");

        updateData.avatar = newAvatar.url;
        updateData.avatarPublicId = newAvatar.public_id;

        // This call is now safe because the utility is robust.
        if (artisanToUpdate.avatarPublicId) {
            await removeFromCloudinary(artisanToUpdate.avatarPublicId);
        }
    }

    const updatedArtisan = await Artisan.findByIdAndUpdate(artisanId, { $set: updateData }, { new: true });
    return res.status(200).json(new ApiResponse(200, updatedArtisan, "Artisan updated successfully"));
});

// The rest of the controller functions (delete, getAll, etc.) remain unchanged.
// Included here for completeness.
const deleteArtisan = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artisanId)) throw new ApiError(400, "Invalid Artisan ID");
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const artisan = await Artisan.findById(artisanId).session(session);
        if (!artisan) throw new ApiError(404, "Artisan not found");
        if (artisan.avatarPublicId) await removeFromCloudinary(artisan.avatarPublicId);
        const agreements = await AgreementDocument.find({ artisanID: artisanId }).session(session);
        if (agreements.length > 0) {
            const agreementPublicIds = agreements.map(doc => doc.filePathPublicId).filter(id => id);
            if (agreementPublicIds.length > 0) await Promise.all(agreementPublicIds.map(id => removeFromCloudinary(id)));
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
        return res.status(200).json(new ApiResponse(200, {}, "Artisan and all related data deleted successfully"));
    } catch (error) {
        await session.abortTransaction();
        console.error("Artisan Deletion Error:", error);
        throw new ApiError(error.statusCode || 500, error.message || "An error occurred during deletion.");
    } finally {
        session.endSession();
    }
});

const getAllArtisans = asyncHandler(async (req, res) => {
    const artisans = await Artisan.find({}).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, { count: artisans.length, artisans }, "Artisans retrieved successfully"));
});

const getArtisanById = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artisanId)) throw new ApiError(400, "Invalid Artisan ID format");
    const artisan = await Artisan.findById(artisanId);
    if (!artisan) throw new ApiError(404, "Artisan not found");
    return res.status(200).json(new ApiResponse(200, artisan, "Artisan fetched successfully"));
});

const getPublicArtisans = asyncHandler(async (req, res) => {
    const artisans = await Artisan.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("name address avatar");
    if (!artisans) throw new ApiError(404, "Could not find any artisans.");
    return res.status(200).json(new ApiResponse(200, { artisans }, "Public artisans fetched successfully"));
});

const getArtisanSales = asyncHandler(async (req, res) => {
    const { artisanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(artisanId)) throw new ApiError(400, "Invalid Artisan ID");
    const sales = await Sale.find({ artisanID: artisanId }).populate("itemID", "name price").sort({ date: -1 });
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalRevenue, 0);
    return res.status(200).json(new ApiResponse(200, { count: sales.length, totalRevenue, sales }, "Artisan sales data fetched successfully"));
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