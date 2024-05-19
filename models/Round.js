'use strict'

const mongoose = require('mongoose');
const questionSchema = require('./Question');

const roundSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxLength: 60
    },
    num_of_questions: {
        type: Number,
        required: [true, "Morate unjeti broj pitanja za rundu."],
        max: [25, "Maksimalno je moguće unjeti 20 pitanja po rundi."],
        min: [1, "Minimalan broj pitanja po rundi je 1."]
    },
    questions: [
        questionSchema
    ],
})

module.exports = roundSchema;