'use strict'

const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    place: {
        type: Number,
        min: 1
    }
});

module.exports = prizeSchema;