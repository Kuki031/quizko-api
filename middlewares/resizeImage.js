'use strict'

const sharp = require('sharp');

module.exports = function (width, height) {
    return async (req, res, next) => {
        if (!req.file) return next();
        req.file.filename = `quiz-${req.body.name}-${Date.now()}.jpeg`;
        const resizedBuffer = await sharp(req.file.buffer).resize(width, height).toFormat('jpeg').jpeg({ quality: 90 }).toBuffer();
        req.file = resizedBuffer;
        next();
    }
}