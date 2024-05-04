'use strict'

const sharp = require('sharp');

module.exports = function (width, height, prefix) {
    return async (req, res, next) => {
        if (!req.file) return next();
        req.file.filename = `${prefix}-${req.body.name}-${Date.now()}.jpeg`;
        const resizedBuffer = await sharp(req.file.buffer).resize(width, height).toFormat('jpeg').jpeg({ quality: 90 }).toBuffer();
        req.file = resizedBuffer;
        next();
    }
}