'use strict'

require('dotenv').config({ path: './config.env' });
module.exports = () => process.env.NODE_ENV === 'production';