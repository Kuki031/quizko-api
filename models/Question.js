'use strict'

const mongoose = require('mongoose');
const answerSchema = require('./Answer');
const imageSchema = require('./Image');

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    num_of_points: {
        type: Number,
        default: 1
    },
    num_of_answers: {
        type: Number,
        enum: [2, 4, 0],
        required: [true, "Morate unjeti nešto od sljedećeg: 2,4 ili 0 ponuđenih odgovora"]
    },
    image: imageSchema,
    answers: [
        answerSchema
    ]
})

module.exports = questionSchema;