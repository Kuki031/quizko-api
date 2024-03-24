'use strict';

module.exports = function (err, req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stackTrace: err.stack,
            isOperational: err.isOperational
        })
    } else if (process.env.NODE_ENV === 'production') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    next(err);
}