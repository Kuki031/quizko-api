'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Morate unjeti ime kategorije."],
        unique: true,
        trim: true,
        lowercase: true,
        maxLength: 60
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});
categorySchema.plugin(uniqueValidator);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
