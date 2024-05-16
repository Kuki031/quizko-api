'use strict'

const { v4: uuidv4 } = require('uuid');

module.exports = function generateRandomUUID() {
    return uuidv4();
}
