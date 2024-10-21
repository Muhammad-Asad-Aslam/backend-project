const asyncHandler = (responseHandler) => {
    (req, res, next) => {
        Promise.resole(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }