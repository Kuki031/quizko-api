'use strict'

const Quiz = require("../models/Quiz");
const ApiError = require("../utils/ApiError");

module.exports = function (id) {
    return async (req, res, next) => {
        try {
            const quiz = await Quiz.findById(req.params[id]);
            if (quiz.created_by.toString() !== req.user.id.toString()) throw new ApiError("Niste kreirali ovaj kviz, ne možete ga uređivati.", 403);
            next();
        }
        catch (err) {
            return next(err);
        }
    }
}
