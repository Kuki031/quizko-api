'use strict'

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');


const app = express();
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json({
    limit: '10kb'
}));
app.use(cookieParser());
app.use(express.urlencoded({
    limit: '10kb',
    extended: true
}))





module.exports = app;
