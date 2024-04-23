'use strict'

const ApiError = require("../utils/ApiError")

module.exports = async function (req, res, next) {
    try {
        const err = new ApiError("Loop Detected (0x911a). The server detected an infinite loop while processing the request.", 508);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    catch (err) {
        return next(err);
    }
}
