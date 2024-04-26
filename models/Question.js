'use strict'

const mongoose = require('mongoose');
const answerSchema = require('./Answer');

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    num_of_points: {
        type: Number,
        default: 1
    },
    num_of_answers: {
        type: Number,
        enum: [2, 4, 1],
        required: [true, "Morate unjeti nešto od sljedećeg: 2,4 ili 1 ponuđenih odgovora"]
    },
    answers: [
        answerSchema
    ]
})

module.exports = questionSchema;