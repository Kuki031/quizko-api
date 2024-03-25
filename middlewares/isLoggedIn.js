'use strict'

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiError = require('../utils/ApiError');

module.exports = async function (req, res, next) {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) token = req.headers.authorization.split(" ")[1];
        else if (req.cookies.jwt) token = req.cookies.jwt;

        if (!token) return next(new ApiError("Niste prijavljeni u aplikaciju.", 403));
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) return next(new ApiError('Korisnik ne postoji.', 404));

        req.user = currentUser;
        next();
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}
