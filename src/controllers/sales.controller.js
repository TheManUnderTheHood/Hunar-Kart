import { Sale } from "../models/Sales.js";

const createSale = async (req, res) => {
    try {
        const sale = await Sale.create(req.body);
        res.status(201).json({ success: true, data: sale });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllSale = async (req, res) => {
    try {
        const sale = await Sale.find({});
        res.status(200).json({ success: true, count: sale.length, data: sale });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { createSale, getAllSale };