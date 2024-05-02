'use strict'

const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
    name: String,
    place: Number
});

module.exports = prizeSchema;