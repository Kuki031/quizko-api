'use strict'

const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');



exports.getPrizesForQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id, { prizes: 1 });

        if (!quiz) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);

        quiz.prizes.sort((a, b) => a.place - b.place)
        res.status(200).json({
            status: 'success',
            numOfPrices: quiz.prizes.length,
            data: {
                quizPrizes: quiz.prizes
            }
        });
    } catch (err) {
        return next(err);
    }
}

exports.createPrize = async function (req, res, next) {
    try {
        const existingPrize = await Quiz.findOne({
            _id: req.params.id,
            "prizes.place": req.body.place
        });
        if (existingPrize) throw new ApiError(`Nagrada za ${req.body.place}. mjesto već postoji.`, 400);

        const prize = {
            name: req.body.name,
            place: req.body.place
        };

        await Quiz.findOneAndUpdate({ _id: req.params.id }, {
            $push: { "prizes": prize }
        });

        res.status(201).json({
            status: 'success',
            prize
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.editPrize = async function (req, res, next) {
    try {
        const prize = await Quiz.findOneAndUpdate({ "prizes._id": req.params.id }, {
            $set: { "prizes.$.name": req.body.name, "prizes.$.place": req.body.place }
        }, {
            runValidators: true,
            new: true
        });

        if (!prize) throw new ApiError(`Nagrada sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(200).json({
            status: 'success',
            prize
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.deletePrize = async function (req, res, next) {
    try {
        const prize = await Quiz.findOneAndUpdate({ "prizes._id": req.params.id }, {
            $pull: { prizes: { _id: req.params.id } }
        });

        if (!prize) throw new ApiError(`Nagrada sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        return next(err);
    }
}