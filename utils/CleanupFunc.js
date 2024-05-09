'use strict'

const mongoose = require('mongoose');

module.exports = async function () {
    try {
        await mongoose.disconnect();
        console.log('Database connection closed.');

    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
}
