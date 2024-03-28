'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const apiError = require('../utils/ApiError');

const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        maxLength: 60,
        required: [true, "Morate unjeti ime kviza."]
    },
    description: {
        type: String,
        default: 'Nema opisa.'
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, "Morate kviz svrstati u kategoriju."]
    },
    is_locked: {
        type: Boolean,
        default: false
    },
    starts_at: {
        type: Date,
        required: [true, "Morate unjeti vrijeme početka kviza."]
    },
    ends_at: {
        type: Date,
        required: [true, "Morate unjeti vrijeme završetka kviza."]
    },
    date_to_signup: {
        type: Date,
        required: [true, "Morate unjeti datum do kada se primaju prijave za kviz."]
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: Date
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
quizSchema.plugin(uniqueValidator);

quizSchema.pre('save', function (next) {

    this.createdAt = Date.now();
    next();
})



const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;