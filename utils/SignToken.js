'use strict'

require('dotenv').config('./config.env');
const jwt = require('jsonwebtoken');

module.exports = function (id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}