'use strict';

const Quiz = require('../models/Quiz');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');



exports.saveQuiz = async function (req, res, next) {
    try {
        const quizId = req.params.quizid;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return next(new ApiError(`Kviz sa ID-em ${quiz.id} ne postoji.`, 404));

        const user = await User.findOne({ _id: req.user.id });

        const exists = user.saved_quizzes.find(quiz => quiz.toString() === quizId);
        if (exists) return next(new ApiError('Kviz je već spremljen u kolekciju.', 400));

        await User.findByIdAndUpdate(req.user.id, {
            $push: { saved_quizzes: quizId }
        }, {
            runValidators: true,
            new: true
        })


        res.status(200).json({
            status: 'success',
            message: 'Kviz uspješno spremljen u kolekciju.'
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

exports.getSavedQuizzes = async function (req, res, next) {
    try {
        const savedQuizzes = await User.findById(req.user.id, { saved_quizzes: true }).populate('saved_quizzes');
        res.status(200).json({
            status: 'success',
            savedQuizzes
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));

    }
}


exports.deleteSavedQuiz = async function (req, res, next) {
    try {
        const quizId = req.params.quizid;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return next(new ApiError(`Kviz sa ID-em ${quiz._id} ne postoji.`, 404));

        const user = await User.findOne({ _id: req.user.id });

        const exists = user.saved_quizzes.find(quiz => quiz.toString() === quizId);
        if (!exists) return next(new ApiError('Kviz ne postoji u Vašoj kolekciji.', 400));

        await User.findByIdAndUpdate(req.user.id, {
            $pull: { saved_quizzes: quizId }
        }, {
            runValidators: true,
            new: true
        })
        res.status(204).json({
            status: 'success',
            message: 'Kviz uspješno izbrisan iz kolekcije.'
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}
