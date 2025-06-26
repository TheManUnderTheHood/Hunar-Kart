import { HandcraftedItem } from "../models/HandcraftedItem.js";

const createHandcraftedItem = async (req, res) => {
    try {
        const handcrafteditem = await HandcraftedItem.create(req.body);
        res.status(201).json({ success: true, data: handcrafteditem });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllHandcraftedItem = async (req, res) => {
    try {
        const handcrafteditem = await HandcraftedItem.find({});
        res.status(200).json({ success: true, count: handcrafteditem.length, data: handcrafteditem });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { createHandcraftedItem, getAllHandcraftedItem };