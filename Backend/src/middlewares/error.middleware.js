import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    // If the error is an instance of our custom ApiError, use its properties
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
        });
    }

    // For any other type of error, return a generic 500 server error
    console.error(err); // Log the unexpected error for debugging
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};

export { errorHandler };