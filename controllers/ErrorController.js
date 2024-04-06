'use strict';

module.exports = function (err, req, res, next) {
    switch (err.name) {
        case "ValidationError":
            err.statusCode = 400;
            err.message = err.message;
            err.stackTrace = err.stack;
            err.isOperational = err.isOperational

            break;
        case "RangeError":
            err.statusCode = 500;
            err.message = 'Nešto nije u redu.';
            err.stackTrace = err.stack;
            err.isOperational = err.isOperational

            break;
        case "DuplicateKeyError":
            err.statusCode = 400;
            err.message = `Vrijednost već postoji: ${err.message}`;
            err.stackTrace = err.stack;
            err.isOperational = err.isOperational;

            break;
        case "JsonWebTokenError":
            err.statusCode = 401;
            err.message = "Neispravan JWT (token).";
            err.stackTrace = err.stack;
            err.isOperational = err.isOperational;

            break;
        case "TokenExpiredError":
            err.statusCode = 401;
            err.message = "JWT (token) je istekao."
            err.stackTrace = err.stack;
            err.isOperational = err.isOperational;

            break;
        case "CastError":
            err.statusCode = 400;
            err.message = `Neispravan format ID-a.`;
            err.stackTrace = err.stack;
            err.isOperational = err.isOperational;

            break;
        default: 0
            break;
    }
    if (err.statusCode === undefined) {
        err.statusCode = 500;
        err.message = 'Nešto nije u redu.';
        err.stackTrace = err.stack;
        err.isOperational = err.isOperational
    }

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stackTrace: err.stack,
            isOperational: err.isOperational
        })
    }

    if (process.env.NODE_ENV === 'production') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    next(err);
}
