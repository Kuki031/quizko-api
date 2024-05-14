'use strict'

const mongoose = require('mongoose');
const teamSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: [true, "Morate unjeti ime tima."]
    },
    points_earned: {
        type: Number,
        default: 0
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})


const Team = mongoose.model('Team', teamSchema);
module.exports = Team;