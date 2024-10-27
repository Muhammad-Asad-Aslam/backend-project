import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";

export const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.accessToken = accessToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "ERROR OCCURED WHILE GENERATIONG TOKENS")
    }
}