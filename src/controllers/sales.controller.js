import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Sale } from "../models/Sales.model.js";
import { HandcraftedItem } from "../models/HandcraftedItem.model.js";
import mongoose from "mongoose";

const createSale = asyncHandler(async (req, res) => {
    const { itemID, artisanID, platformName, quantitySold, totalRevenue } = req.body;

    const requiredFields = { itemID, artisanID, platformName, quantitySold, totalRevenue };
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            throw new ApiError(400, `${field} is required`);
        }
    }

    if (!mongoose.Types.ObjectId.isValid(itemID) || !mongoose.Types.ObjectId.isValid(artisanID)) {
        throw new ApiError(400, "Invalid Item ID or Artisan ID format");
    }

    const item = await HandcraftedItem.findById(itemID);
    if (!item) {
        throw new ApiError(404, "Item to be sold not found.");
    }
    if (item.quantity < quantitySold) {
        throw new ApiError(400, `Not enough stock. Only ${item.quantity} items available.`);
    }

    const sale = await Sale.create({
        itemID,
        artisanID,
        platformName,
        quantitySold,
        totalRevenue,
    });

    if (!sale) {
        throw new ApiError(500, "Failed to record the sale");
    }

    item.quantity -= quantitySold;
    if (item.quantity === 0) {
        item.status = 'Sold';
    }
    await item.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, sale, "Sale recorded successfully")
    );
});

const getAllSale = asyncHandler(async (req, res) => {
    const sales = await Sale.find({})
        .populate("itemID", "name category price")
        .populate("artisanID", "name");

    return res.status(200).json(
        new ApiResponse(200, { count: sales.length, sales }, "Sales data retrieved successfully")
    );
});

const getSaleById = asyncHandler(async (req, res) => {
    const { saleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
        throw new ApiError(400, "Invalid Sale ID format");
    }

    const sale = await Sale.findById(saleId)
        .populate("itemID", "name category price")
        .populate("artisanID", "name");

    if (!sale) {
        throw new ApiError(404, "Sale record not found");
    }

    return res.status(200).json(
        new ApiResponse(200, sale, "Sale record fetched successfully")
    );
});

const deleteSale = asyncHandler(async (req, res) => {
    const { saleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
        throw new ApiError(400, "Invalid Sale ID format");
    }

    const sale = await Sale.findByIdAndDelete(saleId);

    if (!sale) {
        throw new ApiError(404, "Sale record not found");
    }
   
    return res.status(200).json(
        new ApiResponse(200, {}, "Sale record deleted successfully")
    );
});

export { 
    createSale, 
    getAllSale,
    getSaleById,
    deleteSale
};