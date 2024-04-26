'use strict'

const mongoose = require('mongoose');
const teamSchema = new mongoose.Schema({

    name: {
        type: String,
    },
    points_earned: {
        type: Number,
        default: 0
    }
})

module.exports = teamSchema;