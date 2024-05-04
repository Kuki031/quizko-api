'use strict'

const multer = require('multer');
const ApiError = require('../utils/ApiError');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new ApiError('Moguće je samo slike postavljati kao datoteke.', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
module.exports = upload.single('image');