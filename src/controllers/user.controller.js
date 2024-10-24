import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToke = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToke, refreshToken }

    } catch (error) {
        throw new ApiError(500, "ERROR OCCURED WHILE GENERATIONG TOKENS")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullName, email, password } = req.body;

    // Validate required fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "ALL FIELDS ARE REQUIRED");
    }

    // Check if the user already exists by username
    const existedUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existedUser) {
        throw new ApiError(409, "USER ALREADY EXISTS");
    }

    console.log(req.files);

    // Handle file uploads
    const avatarFiles = req.files?.avatar;
    const coverImageFiles = req.files?.coverImage;

    // Ensure avatar is provided
    if (!avatarFiles || avatarFiles.length === 0) {
        throw new ApiError(400, "AVATAR IS REQUIRED");
    }

    // Upload files to Cloudinary
    const avatarLocalPath = avatarFiles[0]?.path;
    const coverImageLocalPath = coverImageFiles?.[0]?.path;

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, "AVATAR UPLOAD FAILED");
    }

    // Create user object and save it to the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // Retrieve the newly created user without the password and refresh token fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "USER REGISTER ERROR");
    }

    // Return a successful response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "USER REGISTERED SUCCESSFULLY")
    );
});

const loginUser = asyncHandler(async (req, res) => {

    // Request body -> data
    // username or email 
    // find the user
    // check password
    // access and refresh token 
    // send in cookies
    // response

    const { email, username, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "USERNAME OR EMAIL REQUIRED")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "USER IS NOT REGISTERED")
    }

    const passwordValidation = await user.isPasswordCorrect(password)

    if (!passwordValidation) {
        throw new ApiError(404, "INVALID USER CREDENTIALS")
    }

    const { accessToken, refreshToken } = await generateTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "USER LOGGED IN SUCCESSFULLY"
        ))
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id
        $set: {
        refreshToken: undefined
    },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.
        status(200)
        .clearCookie("refreshToken", option)
        .clearCookie("accessTokenToken", option)
        .json(new ApiResponse(200), {}, "USER LOGGED OUT SUCCESSFULLY")
})

export {
    registerUser,
    loginUser,
    logoutUser
};
