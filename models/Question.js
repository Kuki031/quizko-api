'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Morate unjeti pitanje."]
    },
    num_of_points: {
        type: Number,
        default: 1
    },
    time_to_answer: {
        type: Number,
        default: 60
    },
    answers: [
        {
            answer: {
                type: String,
                required: [true, "Morate unjeti odgovor."]
            },
            is_correct: {
                type: Boolean,
                default: false
            }
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})
questionSchema.plugin(uniqueValidator);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
