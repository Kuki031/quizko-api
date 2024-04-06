'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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
    scoreboard: {
        name: {
            type: String,
            unique: true
        },
        num_of_teams: {
            type: Number,
            default: 0
        },
        teams: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Team'
        }]
    },
    rounds: [
        {
            name: {
                type: String,
                maxLength: 60
            },
            questions: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Question'
                }
            ],
        }
    ],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

quizSchema.plugin(uniqueValidator);

quizSchema.methods.hasReachedDeadline = (quiz) => Date.now() > quiz.date_to_signup.getTime();
quizSchema.methods.isInProgress = (quiz, currentDate) => quiz.starts_at <= currentDate && currentDate < quiz.ends_at;


const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;