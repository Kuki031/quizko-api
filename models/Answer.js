'use strict'

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    answer: {
        type: String,
        trim: true
    },
    is_correct: {
        type: Boolean,
        default: false
    }
})

module.exports = answerSchema;