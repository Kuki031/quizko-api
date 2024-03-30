'use strict'

const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

exports.createQuiz = async function (req, res, next) {
    try {

        const setCategory = await Category.findOne({ name: req.body.category });
        if (!setCategory) return next(new ApiError(`Kategorija ne postoji.`, 404));

        const quiz = await Quiz.create({
            name: req.body.name,
            description: req.body.description,
            category: setCategory.id,
            is_locked: req.body.is_locked,
            starts_at: req.body.starts_at,
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
        if (err.name === 'ValidationError') return next(new ApiError(err.message, 400));
        if (err.name === 'DuplicateKeyError') return next(new ApiError(err.message, 400));
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

exports.getQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id).populate("category");
        if (!quiz) return next(new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404));

        res.status(200).json({
            status: 'success',
            quiz
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
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
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}


exports.updateQuiz = async function (req, res, next) {
    try {

        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true,
            new: true
        });
        if (req.user.id !== quiz.created_by.toString()) return next(new ApiError("Ne možete pristupiti ovoj lokaciji.", 403));


        res.status(200).json({
            status: 'success',
            quiz
        })

    }
    catch (err) {
        if (err.name === 'ValidationError') return next(new ApiError(err.message, 400));
        if (err.name === 'DuplicateKeyError') return next(new ApiError(err.message, 400));
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}


exports.deleteQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id)
        if (req.user.id !== quiz.created_by.toString()) return next(new ApiError("Ne možete pristupiti ovoj lokaciji.", 403));


        res.status(204).json({
            status: 'success',
            quiz
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

exports.getUserQuizzes = async function (req, res, next) {
    try {
        const quizzes = await Quiz.find({ created_by: req.user.id });
        res.status(200).json({
            status: 'success',
            quizzes
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}


exports.getQuizzesByCategories = async function (req, res, next) {
    try {
        const quizzesByCategory = await Quiz.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"
            },
            {
                $group: {
                    _id: { category: "$categoryDetails.name" },
                    numOfQuizzes: { $count: {} },
                    quizzes: { $push: { quiz: "$name" } }
                }
            },
            {
                $sort: { numOfQuizzes: -1 }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                quizzesByCategory
            }
        });
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
};

