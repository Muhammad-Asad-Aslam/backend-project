import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { ApiError } from "./apiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new ApiError(500, "LOCAL PATH FILE IS MISSING")
        }
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log("FILE HAS BEEN UPLOADED ON CLOUDINARY SUCCESSFULLY", response.url);

        // Delete the local file after successful upload
        try {
            fs.unlinkSync(localFilePath);
            console.log("LOCAL FILE DELETED SUCCESSFULLY");
        } catch (unlinkError) {
            console.error("ERROR DELETING LOCAL FILES:", unlinkError.message);
        }

        return response
    } catch (error) {
        console.error("CLOUDINARY UPLOAD ERROR:", error.message);

        // Re-throw the error to be handled by the calling function
        throw new ApiError(500, "FAILED TO UPLOAD FILES TO CLOUDINARY");
    }
}

export { uploadOnCloudinary }