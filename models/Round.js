'use strict'

const mongoose = require('mongoose');
const questionSchema = require('./Question');

const roundSchema = new mongoose.Schema({
    name: {
        type: String,
        maxLength: 60
    },
    num_of_questions: {
        type: Number,
        required: [true, "Morate unjeti broj pitanja za rundu."]
    },
    questions: [
        questionSchema
    ],
})

module.exports = roundSchema;