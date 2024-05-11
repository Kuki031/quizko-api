'use strict'

const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');


exports.createNewAnswerForQuestion = async function (req, res, next) {
    try {
        const answerExists = await Quiz.exists({
            "rounds.questions._id": req.params.questionid,
            "rounds.questions.answers": {
                $elemMatch: {
                    _id: req.params.questionid,
                    "answers": {
                        answer: req.body.answer,
                        is_correct: req.body.is_correct
                    }
                }
            }
        });

        if (answerExists) throw new ApiError("Odgovor već postoji.", 400);


        const quiz = await Quiz.findOne({ "rounds.questions._id": req.params.questionid });
        if (!quiz) throw new ApiError("Pitanje ne postoji.", 404);


        const round = quiz.rounds.find(round => round.questions.some(q => q._id.toString() === req.params.questionid));
        if (!round) throw new ApiError("Runda ne postoji.", 404);


        const question = round.questions.find(q => q._id.toString() === req.params.questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);


        if (question.answers.length >= question.num_of_answers) throw new ApiError("Dosegnuli ste kapacitet broja odgovora u pitanju.", 400);


        const updatedQuiz = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            {
                $push: {
                    "rounds.$.questions.$[inner].answers": {
                        answer: req.body.answer,
                        is_correct: req.body.is_correct
                    }
                }
            },
            {
                arrayFilters: [{ "inner._id": req.params.questionid }],
                new: true
            }
        );

        const newAnswer = question.answers.find(answer => answer.answer === req.body.answer);
        res.status(201).json({
            status: 'success',
            message: "Odgovor kreiran."
        });
    } catch (err) {
        return next(err);
    }
};


exports.editAnswer = async function (req, res, next) {
    try {
        const updatedQuiz = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid, "rounds.questions.answers._id": req.params.answerid },
            {
                $set: {
                    "rounds.$[outer].questions.$[inner].answers.$[answer].answer": req.body.answer,
                    "rounds.$[outer].questions.$[inner].answers.$[answer].is_correct": req.body.is_correct
                }
            },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                    { "inner._id": req.params.questionid },
                    { "answer._id": req.params.answerid }
                ],
                new: true
            }
        );

        if (!updatedQuiz) throw new ApiError("Traženi odgovor na ovo pitanje ne postoji.", 404);

        const round = updatedQuiz.rounds.find(round => round.questions.some(q => q._id.toString() === req.params.questionid));
        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const question = round.questions.find(q => q._id.toString() === req.params.questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        const updatedAnswer = question.answers.find(answer => answer._id.toString() === req.params.answerid);

        res.status(200).json({
            status: 'success',
            answer: updatedAnswer
        });
    } catch (err) {
        return next(err);
    }
}

exports.deleteAnswer = async function (req, res, next) {
    try {
        const updatedQuiz = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            { $pull: { "rounds.$[outer].questions.$[inner].answers": { _id: req.params.answerid } } },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                    { "inner._id": req.params.questionid }
                ],
                new: true
            }
        );

        if (!updatedQuiz) throw new ApiError("Traženi odgovor na ovo pitanje ne postoji.", 404);

        const round = updatedQuiz.rounds.find(round => round.questions.some(q => q._id.toString() === req.params.questionid));
        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const question = round.questions.find(q => q._id.toString() === req.params.questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        return next(err);
    }
}
