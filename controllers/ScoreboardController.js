'use strict'

const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');


exports.getScoreboard = async function (req, res, next) {
    try {

        const scoreboard = await Quiz.findById(req.params.id).select("scoreboard");
        if (!scoreboard) throw new ApiError("Bodovna ljestvica ne postoji.", 404);
        await scoreboard.scoreboard.populate("teams");

        scoreboard.scoreboard.teams.sort((a, b) => b.points_earned - a.points_earned);

        res.status(200).json({
            status: 'success',
            data: {
                scoreboard: scoreboard.name,
                scoreboard
            }
        })
    }
    catch (err) {
        return next(err);
    }
}


exports.addTeamOnScoreboardManually = async function (req, res, next) {
    try {

        const scoreboard = await Quiz.findById(req.params.scoreboard);
        if (!scoreboard) throw new ApiError(`Kviz sa ID-em ${req.params.scoreboard} ne postoji.`, 404);
        const teams = scoreboard.scoreboard.teams;

        const team = await Team.findById(req.params.team);
        if (!team) throw new ApiError(`Tim sa ID-em ${req.params.team} ne postoji.`, 404);
        const checkForDups = teams.find(t => t._id.toString() === team._id.toString());

        if (checkForDups) throw new ApiError(`Tim sa imenom ${team.name} već postoji na bodovnoj ljestvici.`, 400);

        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.scoreboard, {
            $push: { "scoreboard.teams": req.params.team },
            $inc: { "scoreboard.num_of_teams": 1 }
        }, {
            runValidators: true,
            new: true
        });


        res.status(200).json({
            status: 'success',
            updatedQuiz
        })

    }
    catch (err) {
        return next(err);
    }
}


exports.updateTeamOnScoreboard = async function (req, res, next) {
    try {
        const team = await Team.findByIdAndUpdate(req.params.teamid, {
            points_earned: req.body.points_earned
        },
            {
                runValidators: true,
                new: true
            })

        if (!team) throw new ApiError(`Tim sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(200).json({
            status: 'success',
            data: {
                team
            }
        });
    } catch (err) {
        return next(err);
    }
}
