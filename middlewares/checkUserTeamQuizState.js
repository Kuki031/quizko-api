'use strict'

const ApiError = require('../utils/ApiError');

module.exports = async function (req, res, next) {
    if (req.user.is_in_team || req.user.is_currently_in_quiz) {
        const err = new ApiError("Već pripadate timu ili ste već prijavljeni na kviz.", 400);
        return res.status(err.statusCode).json({ status: err.status, message: err.message });
    }
    next();
}

