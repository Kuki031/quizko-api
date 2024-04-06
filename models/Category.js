'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, "Morate unjeti naziv kategorije."]
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})
categorySchema.plugin(uniqueValidator);
categorySchema.index({ name: 1 }, { unique: true })

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
