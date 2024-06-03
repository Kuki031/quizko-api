'use strict'

const User = require('../models/User');
const ApiError = require('../utils/ApiError');

module.exports = async function (req, res, next) {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) throw new ApiError(`Korisnik sa korisničkim imenom ${req.body.username} ne postoji.`, 404);
        req.queiredUser = user;
        next();
    }
    catch (err) {
        return next(err);
    }
}
