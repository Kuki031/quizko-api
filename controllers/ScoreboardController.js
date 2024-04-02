'use strict'

const ApiFeatures = require('../utils/ApiFeatures');
const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');
const Team = require('../models/Team');


//User dohvaca scoreboard kviza (samo kviz u kojem je njegov tim) po nekom ID-u
exports.getScoreboard = async function (req, res, next) {
    try {

        const scoreboard = await Quiz.findById(req.params.id).select("scoreboard");
        if (!scoreboard) return next(new ApiError("Bodovna ljestvica ne postoji.", 404));

        const query = new ApiFeatures(Team.find({ _id: scoreboard.scoreboard.teams }), req.query).filter().sort("-points_earned");
        const teams = await query.query.select("name points_earned");

        res.status(200).json({
            status: 'success',
            data: {
                scoreboard: scoreboard.scoreboard.name,
                teams
            }
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

//Updateanje tima na scoreboardu (samo admin kviza)
exports.updateTeamOnScoreboard = async function (req, res, next) {
    try {

        const quiz = await Quiz.findById(req.params.id);
        //Provjeri jel logirani user kreirao kviz
        if (!req.user.hasCreatedQuiz(req.user, quiz)) return next(new ApiError("Niste kreirali ovaj kviz, te ne možete uređivati bodovnu ljestvicu.", 403));

        //Updateaj tim na scoreboardu
        const teamToUpdate = await Team.findOneAndUpdate({ name: req.body.name }, { points_earned: req.body.points_earned }, { runValidators: true, new: true });

        res.status(200).json({
            status: 'success',
            data: {
                scoreboard: quiz.scoreboard.name,
                teamToUpdate
            }
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}