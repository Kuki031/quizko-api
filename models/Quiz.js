'use strict'

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const uniqueValidator = require('mongoose-unique-validator');
const roundSchema = require('./Round');
const prizeSchema = require('./Prize');
const imageSchema = require('./Image');

const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxLength: 60,
        required: [true, "Morate unjeti ime kviza."]
    },
    join_code: {
        type: String,
        maxLength: 6
    },
    description: {
        type: String,
        default: 'Nema opisa.'
    },
    image: imageSchema,
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    },
    prizes: [
        prizeSchema
    ],
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
        required: [true, "Morate unjeti broj rundi."],
        max: [25, "Maksimalno je moguće unjeti 25 rundi."],
        min: [1, "Minimalan broj rundi po kvizu je 1 runda."]
    },
    scoreboard: {
        name: String,
        num_of_teams: {
            type: Number,
            default: 0
        },
        teams: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Team'
            }
        ]
    },
    rounds: [
        roundSchema
    ],
    user_log: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
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
quizSchema.index({ 'prizes._id': 1 });
quizSchema.index({ 'scoreboard._id': 1 });
quizSchema.plugin(uniqueValidator);

quizSchema.pre('save', function (next) {
    this.join_code = uuidv4().slice(0, 6);
    next();
})

quizSchema.methods.hasReachedDeadline = (quiz) => Date.now() > quiz.date_to_signup.getTime();

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
