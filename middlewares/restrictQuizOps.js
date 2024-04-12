'use strict'

const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');

module.exports = async function (req, res, next) {
    try {
        if (req.params.roundid) {
            const quiz = await Quiz.findOne({ "rounds._id": req.params.roundid });
            if (!quiz) return next(new ApiError("Traženi resurs ne postoji.", 404));
            if (quiz.created_by.toString() !== req.user.id) return next(new ApiError("Niste kreirali ovaj kviz, ne možete uređivati kviz.", 403));
        }

        if (req.params.questionid) {
            const quiz = await Quiz.findOne({ "rounds.questions._id": req.params.questionid });
            if (!quiz) return next(new ApiError("Traženi resurs ne postoji.", 404));
            if (quiz.created_by.toString() !== req.user.id) return next(new ApiError("Niste kreirali ovaj kviz, ne možete uređivati kviz", 403));
        }

        if (req.params.answerid) {
            const quiz = await Quiz.findOne({ "rounds.questions.answers._id": req.params.answerid });
            if (!quiz) return next(new ApiError("Traženi resurs ne postoji.", 404));
            if (quiz.created_by.toString() !== req.user.id) return next(new ApiError("Niste kreirali ovaj kviz, ne možete uređivati kviz", 403));
        }
        next();
    }
    catch (err) {
        return next(err);
    }
}

