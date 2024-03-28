'use strict'

const ApiError = require("../utils/ApiError")

module.exports = function (req, res, next) {
    if (req.user.role !== 'Administrator') return next(new ApiError("Nemate pravo pristupiti ovoj lokaciji.", 403));
    next();
}


