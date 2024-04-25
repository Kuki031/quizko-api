'use strict'


const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');


exports.newQuestion = async function (req, res, next) {
    try {
        const round = await Quiz.findOne({ "rounds._id": req.params.roundid }, { "rounds.$": 1 });
        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const checkDuplicate = round.rounds[0].questions.find(question => question.name === req.body.name);
        if (checkDuplicate) throw new ApiError(`Pitanje "${req.body.name}" već postoji.`, 400);

        if (round.rounds[0].num_of_questions === round.rounds[0].questions.length) throw new ApiError("Dosegnut kapacitet broja pitanja u rundi.", 400);


        const newQuestion = await Quiz.findOneAndUpdate(
            { "rounds._id": req.params.roundid },
            { $push: { "rounds.$.questions": { "name": req.body.name, "num_of_points": req.body.num_of_points, "num_of_answers": req.body.num_of_answers } } },
            { runValidators: true, new: true }
        );


        res.status(201).json({
            status: 'success',
            newQuestion
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.editQuestion = async function (req, res, next) {
    try {
        const question = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            {
                $set: {
                    "rounds.$[outer].questions.$[inner].name": req.body.name,
                    "rounds.$[outer].questions.$[inner].num_of_points": req.body.num_of_points,
                    "rounds.$[outer].questions.$[inner].num_of_answers": req.body.num_of_answers
                }
            },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                    { "inner._id": req.params.questionid }
                ],
                runValidators: true,
                new: true
            }
        );

        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            question
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.deleteQuestion = async function (req, res, next) {
    try {
        const question = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            {
                $pull: {
                    "rounds.$[outer].questions": { _id: req.params.questionid },
                }
            },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                ],
                new: true
            }
        );

        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(204).json({
            status: 'success',
            question
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.queryAllQuestionsFromRound = async function (req, res, next) {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const round = await Quiz.findOne(
            { "rounds._id": req.params.roundid },
            { "rounds.$": 1 }
        );

        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const questions = round.rounds[0].questions;
        const paginatedQuestions = questions.slice(skip, skip + limit);

        res.status(200).json({
            status: 'success',
            currentPage: page,
            totalQuestions: questions.length,
            questions: paginatedQuestions
        });
    }
    catch (err) {
        return next(err);
    }
}

exports.getSingleQuestion = async function (req, res, next) {
    try {
        const round = await Quiz.findOne({ "rounds.questions._id": req.params.questionid }, { "rounds.$": 1 });

        if (!round) throw new ApiError("Runda ne postoji.", 404);
        const questions = round.rounds[0].questions;
        const question = questions.find(q => q._id.toString() === req.params.questionid);

        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            question
        })

    }
    catch (err) {
        return next(err);
    }
}