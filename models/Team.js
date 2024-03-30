'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Morate unjeti ime Vašeg tima."],
        unique: true
    },
    points_earned: {
        type: Number,
        default: 0
    },
    capacity: {
        type: Number,
        default: 4
    },
    num_of_members: {
        type: Number,
        default: 0
    },
    team_leader: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    team_members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    quiz: {
        type: mongoose.Schema.ObjectId,
        ref: 'Quiz'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
teamSchema.plugin(uniqueValidator);
teamSchema.pre('save', function (next) {
    this.num_of_members++;
    next();
})



const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
