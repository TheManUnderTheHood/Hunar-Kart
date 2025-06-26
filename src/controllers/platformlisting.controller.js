import { PlatformListing } from "../models/PlatformListing.js";

const createPlatformListing = async (req, res) => {
    try {
        const platformlisting = await PlatformListing.create(req.body);
        res.status(201).json({ success: true, data: platformlisting });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllPlatformListing = async (req, res) => {
    try {
        const platformlisting = await PlatformListing.find({});
        res.status(200).json({ success: true, count: platformlisting.length, data: platformlisting });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { createPlatformListing, getAllPlatformListing };