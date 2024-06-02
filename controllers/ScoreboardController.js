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
        const teams = await scoreboard.scoreboard.populate("teams");

        const checkForDups = teams.teams.find(t => t.name === req.body.name);
        if (checkForDups) throw new ApiError(`Tim sa imenom ${req.body.name} već postoji na bodovnoj ljestvici.`, 400);

        const checkIfUserIsLogged = scoreboard.user_log.find(x => x._id.toString() === req.params.userid);
        if (checkIfUserIsLogged) throw new ApiError(`Korisnik sa ID-em ${req.params.userid} već ima prijavljen tim na ovom kvizu.`, 403);

        const team = await Team.create({
            name: req.body.name,
            capacity: req.body.capacity,
            created_by: req.params.userid
        });

        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.scoreboard, {
            $push: { "scoreboard.teams": team._id, "user_log": req.params.userid },
            $inc: { "scoreboard.num_of_teams": 1 }
        }, {
            runValidators: true,
            new: true
        });

        await User.findByIdAndUpdate(req.params.userid, { $push: { "teams": team._id } });

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
