import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler( async (req, res) => {
    
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username and email
    // check for images, check for avatar
    // upload them to cloudinary, avatar hai ya nahi
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for response of user creation and if yes retrn yes else error

    const { username, fullName, email, password } = req.body

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "ALL FIELDS ARE REQUIRED");
    }

    const existedUser = User.findOne( username )

    if (existedUser) {
        throw new ApiError(409, "USER ALREADY EXISTS")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "AVATAR IS REQUIRED")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "AVATAR IS REQUIRED")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "USER REGISTER ERROR")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "USER REGISTRED SUCCESSFULLY")
    )
})

export { registerUser }