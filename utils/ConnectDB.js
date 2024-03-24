'use strict'

const mongoose = require('mongoose');


module.exports = async function (connection_string, pw) {
    try {
        await mongoose.connect(connection_string.replace('<password>', pw));
        console.log('Spajanje s bazom uspješno.');
    }
    catch (e) {
        console.error('Spajanje s bazom neuspješno.');
    }
}
