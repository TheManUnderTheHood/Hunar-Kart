import { Artisan } from "../models/Artisan.model.js";

const createArtisan = async (req, res) => {
    try {
        const artisan = await Artisan.create(req.body);
        res.status(201).json({ success: true, data: artisan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllArtisans = async (req, res) => {
    try {
        const artisans = await Artisan.find({});
        res.status(200).json({ success: true, count: artisans.length, data: artisans });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { createArtisan, getAllArtisans };