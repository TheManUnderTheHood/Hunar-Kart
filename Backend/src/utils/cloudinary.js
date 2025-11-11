import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully, now remove the local copy
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        // Ensure local file is removed even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

const removeFromCloudinary = async (publicId) => {
    // --- START OF FIX ---
    // 1. Immediately return if publicId is missing to prevent errors.
    if (!publicId) {
        console.log("No publicId provided to removeFromCloudinary.");
        return null;
    }

    try {
        // 2. Be explicit with the resource type. For avatars, it's "image".
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        if (result.result === 'ok') {
            console.log("Successfully deleted resource from Cloudinary:", publicId);
        } else {
             console.log("Cloudinary deletion status not 'ok':", result.result);
        }
        
        return result;

    } catch (error) {
        // 3. Log the specific error but DO NOT crash the server.
        console.error("Error removing file from Cloudinary:", error.message);
        return null; // Return null to indicate failure without crashing.
    }
    // --- END OF FIX ---
};

export { uploadOnCloudinary, removeFromCloudinary };
