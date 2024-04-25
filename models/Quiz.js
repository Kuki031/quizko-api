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
    num_of_rounds: {
        type: Number,
        required: [true, "Morate unjeti broj rundi"]
    },
    scoreboard: {
        name: {
            type: String
        },
        num_of_teams: {
            type: Number,
            default: 0
        },
        teams: [
            {
                name: {
                    type: String
                },
                points_earned: {
                    type: Number,
                    default: 0
                }
            }
        ]
    },
    rounds: [
        {
            name: {
                type: String,
                maxLength: 60
            },
            num_of_questions: {
                type: Number,
                required: [true, "Morate unjeti broj pitanja za rundu."]
            },
            questions: [
                {
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
                        {
                            answer: {
                                type: String
                            },
                            is_correct: {
                                type: Boolean,
                                default: false
                            }
                        }
                    ]
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