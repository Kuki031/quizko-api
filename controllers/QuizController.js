'use strict'

const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

exports.createQuiz = async function (req, res, next) {
    try {

        const setCategory = await Category.findOne({ name: req.body.category });
        if (!setCategory) throw new ApiError(`Kategorija ne postoji.`, 404);

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
        const quizzes = await Quiz.find({ created_by: req.user.id });
        res.status(200).json({
            status: 'success',
            quizzes
        })
    }
    catch (err) {
        return next(err);
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
        return next(err);
    }
};

//Runde
exports.createNewRoundForQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Niste kreirali ovaj kviz.", 403);

        quiz.rounds.push({
            name: req.body.name
        });
        await quiz.save();

        res.status(201).json({
            status: 'success',
            round: req.body.name
        })
    }

    catch (err) {
        return next(err);
    }
}

//Uredi rundu (samo ime)
exports.editRoundForQuiz = async function (req, res, next) {
    try {
        const { roundid, quizid } = req.params;
        const roundInQuiz = await Quiz.findById(quizid);

        if (!roundInQuiz) throw new ApiError(`Kviz ne postoji.`, 404);
        const round = roundInQuiz.rounds.findIndex(round => round.id === roundid);

        if (round === -1) throw new ApiError(`Runda za kviz ne postoji.`, 404);

        if (!req.user.hasCreatedQuiz(req.user, roundInQuiz)) throw new ApiError("Niste kreirali ovaj kviz, s toga ne možete uređivati rundu kviza.", 403);

        roundInQuiz.rounds[round].name = req.body.name;
        await roundInQuiz.save();
        res.status(200).json({
            status: 'success',
            round: roundInQuiz.rounds[round]
        })
    }
    catch (err) {
        return next(err);
    }
}

//Izbrisi rundu (obrisat ce ref na question entity, ali ne i pitanja)
exports.deleteRoundForQuiz = async function (req, res, next) {
    try {
        const { roundid, quizid } = req.params;
        const roundInQuiz = await Quiz.findById(quizid);

        if (!roundInQuiz) throw new ApiError(`Kviz ne postoji.`, 404);
        const round = roundInQuiz.rounds.findIndex(round => round.id === roundid);
        if (round === -1) throw new ApiError(`Runda za kviz ne postoji.`, 404);
        if (!req.user.hasCreatedQuiz(req.user, roundInQuiz)) throw new ApiError("Niste kreirali ovaj kviz, s toga ne možete uređivati rundu kviza.", 403);

        await Quiz.findByIdAndUpdate(quizid, { $pull: { rounds: { _id: roundid } } })

        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        return next(err);
    }
}

//Dohvati sve runde i populate pitanja za kviz
exports.getAllRoundsForQuiz = async function (req, res, next) {
    try {
        const rounds = await Quiz.findById(req.params.id).select("rounds");

        if (!rounds) throw new ApiError("Kviz ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            rounds
        });
    }
    catch (err) {
        return next(err);
    }
}

//Dohvati jednu rundu
exports.getSingleRound = async function (req, res, next) {
    try {
        const { roundid, quizid } = req.params;
        const singleQuizRound = await Quiz.findById(quizid);

        if (!singleQuizRound) throw new ApiError(`Kviz ne postoji.`, 404);
        const round = singleQuizRound.rounds.find(round => round.id === roundid);
        if (!round) throw new ApiError(`Runda za kviz ne postoji.`, 404);
        if (!req.user.hasCreatedQuiz(req.user, singleQuizRound)) throw new ApiError("Niste kreirali ovaj kviz, s toga ne možete vidjeti rundu kviza.", 403);

        res.status(200).json({
            status: 'success',
            round
        })
    }
    catch (err) {
        return next(err);
    }
}