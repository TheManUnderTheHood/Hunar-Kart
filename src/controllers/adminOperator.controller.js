import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AdminOperator } from "../models/AdminOperator.model.js";
import {uploadOnCloudinary, removeFromCloudinary} from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await AdminOperator.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
}

const registerAdminOperator = asyncHandler(async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }
    const { name, email, contactNumber, password, role } = req.body;

    if ([name, email, contactNumber, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await AdminOperator.findOne({ email });

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    // Upload the avatar file from its temporary local path to Cloudinary.
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await AdminOperator.create({
        name,
        avatar: avatar?.url || "",
        email,
        contactNumber,
        password,
        role
    });

    const createdUser = await AdminOperator.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginAdminOperator = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await AdminOperator.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await AdminOperator.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // use secure cookies in production
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutAdminOperator = asyncHandler(async (req, res) => {
    await AdminOperator.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true }
    );
    
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const getAllAdminOperator = asyncHandler(async (req, res) => {

    const adminOperators = await AdminOperator.find({}).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, { count: adminOperators.length, operators: adminOperators }, "Admin operators fetched successfully")
    );
});

function getPublicIdFromUrl(url) {
    const parts = url.split('/');
    const fileWithExtension = parts[parts.length - 1];
    const publicId = fileWithExtension.substring(0, fileWithExtension.lastIndexOf('.'));
    return publicId;
}

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token provided");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await AdminOperator.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, contactNumber } = req.body;
    
    if (!name && !contactNumber) {
        throw new ApiError(400, "At least one field (name or contactNumber) must be provided for update.");
    }
    
    const user = await AdminOperator.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                ...(name && { name }), 
                ...(contactNumber && { contactNumber })
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const newAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!newAvatar?.url) {
        throw new ApiError(500, "Error while uploading avatar to Cloudinary");
    }

    const oldAvatarUrl = req.user.avatar;
    if (oldAvatarUrl) {
        const publicId = getPublicIdFromUrl(oldAvatarUrl);
        await removeFromCloudinary(publicId);
    }
    
    const user = await AdminOperator.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: newAvatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

export { 
    registerAdminOperator, 
    loginAdminOperator, 
    logoutAdminOperator, 
    getAllAdminOperator,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar 
};