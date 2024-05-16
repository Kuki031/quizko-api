'use strict'

const User = require('../models/User');
const ApiError = require('../utils/ApiError');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.has_confirmed_email) throw new ApiError(`Ne možete pristupiti ovoj lokaciji jer niste potvrdili e-mail adresu.`, 403);
        next();
    }
    catch (err) {
        return next(err);
    }
}
