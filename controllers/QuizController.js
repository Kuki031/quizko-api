'use strict'

const Quiz = require('../models/Quiz');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const Pagination = require('../utils/Pagination');

exports.createQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.create({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            is_locked: req.body.is_locked,
            starts_at: req.body.starts_at,
            num_of_rounds: req.body.num_of_rounds,
            ends_at: req.body.ends_at,
            date_to_signup: req.body.date_to_signup,
            created_by: req.user.id,
            scoreboard: {
                name: `${req.body.name}-scoreboard`
            }
        });
        await User.findByIdAndUpdate(req.user.id, {
            $push: { saved_quizzes: quiz.id }
        })
        res.status(201).json({
            status: 'success',
            quiz
        })

    }
    catch (err) {
        return next(err);
    }
}

exports.getQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id).populate("category");
        if (!quiz) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(200).json({
            status: 'success',
            quiz
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.getAllQuizzes = async function (req, res, next) {
    try {
        const quizzes = await Quiz.find();
        res.status(200).json({
            status: 'success',
            quizzes
        })
    }
    catch (err) {
        return next(err);
    }
}


exports.updateQuiz = async function (req, res, next) {
    try {

        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true,
            new: true
        });
        if (!quiz) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Ne možete pristupiti ovoj lokaciji.", 403);


        res.status(200).json({
            status: 'success',
            quiz
        })

    }
    catch (err) {
        return next(err);
    }
}


exports.deleteQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id)
        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Ne možete pristupiti ovoj lokaciji.", 403);


        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.getUserQuizzes = async function (req, res, next) {
    try {

        const { page, limit, skip } = Pagination(req.query.page, req.query.limit);

        const quizzes = await Quiz.find({ created_by: req.user.id });
        const quizzesP = quizzes;
        const paginatedQuizzes = quizzesP.slice(skip, skip + limit);
        res.status(200).json({
            status: 'success',
            paginatedQuizzes
        })
    }
    catch (err) {
        return next(err);
    }
}
