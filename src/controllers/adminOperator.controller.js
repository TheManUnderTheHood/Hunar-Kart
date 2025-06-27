import { AdminOperator } from "../models/AdminOperator.model.js";

const createAdminOperator = async (req, res) => {
    try {
        const adminoperator = await AdminOperator.create(req.body);
        res.status(201).json({ success: true, data: adminoperator });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllAdminOperator = async (req, res) => {
    try {
        const adminoperator = await AdminOperator.find({});
        res.status(200).json({ success: true, count: adminoperator.length, data: adminoperator });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { createAdminOperator, getAllAdminOperator };