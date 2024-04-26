'use strict'

const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');
const checkDuplicate = require('../utils/Duplicate');

exports.createNewRoundForQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Niste kreirali ovaj kviz.", 403);

        let checkForDups = checkDuplicate(quiz.rounds, req.body)
        if (checkForDups) throw new ApiError(`Pitanje "${req.body.name}" već postoji.`, 400);
        if (quiz.rounds.length === quiz.num_of_rounds) throw new ApiError("Dosegnut kapacitet broja rundi u kvizu.", 400);

        else quiz.rounds.push({
            name: req.body.name,
            num_of_questions: req.body.num_of_questions
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

        const round = await Quiz.findOneAndUpdate(
            { "rounds._id": req.params.roundid },
            { $set: { "rounds.$.name": req.body.name, "rounds.$.num_of_questions": req.body.num_of_questions } },
            { runValidators: true, new: true }
        );

        if (!round) throw new ApiError("Runda za kviz ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            round
        })
    }
    catch (err) {
        return next(err);
    }
}

//Izbrisi rundu
exports.deleteRoundForQuiz = async function (req, res, next) {
    try {
        const round = await Quiz.findOneAndUpdate(
            { "rounds._id": req.params.roundid },
            { $pull: { rounds: { _id: req.params.roundid } } },
        );

        if (!round) throw new ApiError("Runda za kviz ne postoji.", 404);

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

        const round = await Quiz.findOne({ "rounds._id": req.params.roundid }, { "rounds.$": 1 })

        if (!round) throw new ApiError("Runda ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            round
        })
    }
    catch (err) {
        return next(err);
    }
}