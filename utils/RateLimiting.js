'use strict'

const { rateLimit } = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    validate: {
        trustProxy: false
    },
    message: "Previše zahtjeva odjednom, pokušajte ponovno za 1 sat."
});
