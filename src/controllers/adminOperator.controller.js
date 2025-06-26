import { AdminOperator } from "../models/AdminOperator.js";

// Create a new artisan
const createAdminOperator = async (req, res) => {
    try {
        const adminoperator = await AdminOperator.create(req.body);
        res.status(201).json({ success: true, data: adminoperator });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all adminoperator
const getAllAdminOperator = async (req, res) => {
    try {
        const adminoperator = await AdminOperator.find({});
        res.status(200).json({ success: true, count: adminoperator.length, data: adminoperator });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { createAdminOperator, getAllAdminOperator };