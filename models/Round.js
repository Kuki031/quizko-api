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
        max: [20, "Maksimalno je moguće unjeti 20 pitanja po rundi."],
        min: [5, "Minimalan broj pitanja po rundi je 5."]
    },
    questions: [
        questionSchema
    ],
})

module.exports = roundSchema;