'use strict'

const ApiFeatures = require('../utils/ApiFeatures');
const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');


//User dohvaca scoreboard kviza (samo kviz u kojem je njegov tim) po nekom ID-u
exports.getScoreboard = async function (req, res, next) {
    try {

        const scoreboard = await Quiz.findById(req.params.id).select("name scoreboard.teams");
        if (!scoreboard) throw new ApiError("Bodovna ljestvica ne postoji.", 404);
        scoreboard.scoreboard.teams.sort((a, b) => b.points_earned - a.points_earned);

        res.status(200).json({
            status: 'success',
            data: {
                scoreboard: scoreboard.scoreboard.name,
                scoreboard
            }
        })
    }
    catch (err) {
        return next(err);
    }
}


exports.createNewTeam = async function (req, res, next) {
    try {

        const fetchTeamsForDup = await Quiz.findById(req.params.id).select("scoreboard.teams");
        const teams = fetchTeamsForDup.scoreboard.teams.find(team => team.name === req.body.name);
        if (teams) throw new ApiError(`Tim sa imenom ${req.body.name} već postoji.`, 400);

        const newTeam = await Quiz.findByIdAndUpdate(req.params.id, {
            $push: { "scoreboard.teams": { name: req.body.name }, }, $inc: { "scoreboard.num_of_teams": 1 }
        }, {
            runValidators: true,
            new: true
        }
        );

        if (!newTeam) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(201).json({
            status: 'success',
            newTeam
        })
    }
    catch (err) {
        return next(err);
    }
}


//Updateanje tima na scoreboardu (samo admin kviza)
exports.updateTeamOnScoreboard = async function (req, res, next) {
    try {

        const team = await Quiz.findOneAndUpdate({ "scoreboard.teams._id": req.params.id }, {
            $set: {
                "scoreboard.teams.$.name": req.body.name,
                "scoreboard.teams.$.points_earned": req.body.points_earned
            }
        }, {
            runValidators: true,
            new: true
        });

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
