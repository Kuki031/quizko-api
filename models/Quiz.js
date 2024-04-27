'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const teamSchema = require('./Team');
const roundSchema = require('./Round');

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
    starts_at: {
        type: Date,
        required: [true, "Morate unjeti vrijeme početka kviza."]
    },
    /*ends_at: {
        type: Date,
        required: [true, "Morate unjeti vrijeme završetka kviza."]
    },*/
    date_to_signup: {
        type: Date,
        required: [true, "Morate unjeti datum do kada se primaju prijave za kviz."]
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    num_of_rounds: {
        type: Number,
        required: [true, "Morate unjeti broj rundi"]
    },
    scoreboard: {
        name: String,
        num_of_teams: {
            type: Number,
            default: 0
        },
        teams: [
            teamSchema
        ]
    },
    rounds: [
        roundSchema
    ],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})


quizSchema.index({ 'rounds.questions.answers._id': 1 });
quizSchema.index({ 'rounds.questions._id': 1 });
quizSchema.index({
    'rounds.questions._id': 1,
    'rounds.questions.answers._id': 1
});
quizSchema.index({ 'rounds._id': 1 });
quizSchema.index({ 'scoreboard.teams._id': 1 });
quizSchema.plugin(uniqueValidator);


quizSchema.methods.hasReachedDeadline = (quiz) => Date.now() > quiz.date_to_signup.getTime();
quizSchema.methods.isInProgress = (quiz, currentDate) => quiz.starts_at <= currentDate && currentDate < quiz.ends_at;


const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
