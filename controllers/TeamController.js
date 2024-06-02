'use strict'

const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');

exports.getMyTeams = async function (req, res, next) {
    try {

        const team = await User.findById(req.user.id).populate("teams").select("teams");

        res.status(200).json({
            status: 'success',
            team
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.updateMyTeam = async function (req, res, next) {
    try {

        const team = await Team.findById(req.params.id);
        if (!req.user.hasCreatedTeam(req.user, team)) throw new ApiError("Niste kreirali ovaj tim, te ga ne možete ažurirati.", 400);

        const updatedTeam = await Team.findByIdAndUpdate(req.params.id, {
            name: req.body.name
        }, {
            runValidators: true,
            new: true
        });
        if (!updatedTeam) throw new ApiError(`Tim sa ID-em ${req.params.id} ne postoji.`, 404);



        res.status(200).json({
            status: 'success',
            updatedTeam
        });

    } catch (err) {
        return next(err);
    }
}


exports.deleteMyTeam = async function (req, res, next) {
    try {

        const user = await User.findById(req.user.id);
        const team = await Team.findById(req.params.id);
        if (!user.hasCreatedTeam(user, team)) throw new ApiError("Niste kreirali ovaj tim, te ga ne možete obrisati.", 400);

        const teamId = req.params.id;

        await Promise.all([
            User.findByIdAndUpdate(user.id, { $pull: { "teams": teamId } }),
            Quiz.updateMany({ "scoreboard.teams": teamId }, {
                $pull: { "scoreboard.teams": teamId },
                $pull: { "user_log": user.id },
                $inc: { "scoreboard.num_of_teams": -1 }
            }),
            Team.findByIdAndDelete(teamId)
        ])



        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (err) {
        return next(err);
    }
}



exports.joinQuiz = async function (req, res, next) {
    try {

        const getQuizByPassCode = await Quiz.findOne({ join_code: req.body.join_code });
        if (!getQuizByPassCode) throw new ApiError(`Kviz sa ovim kodom ne postoji ili je kod neispravan.`, 403);

        const user = await User.findById(req.user.id);

        const extractTeams = await getQuizByPassCode.scoreboard.populate("teams");
        const checkForDups = extractTeams.teams.find(x => x.name === req.body.name);
        if (checkForDups) throw new ApiError(`Tim "${req.body.name}" već postoji na bodovnoj ljestvici.`, 400);

        const checkIfUserIsLogged = getQuizByPassCode.user_log.find(x => x._id.toString() === user._id.toString());
        if (checkIfUserIsLogged) throw new ApiError(`Već imate tim prijavljen na ovom kvizu.`, 403);

        const newTeam = await Team.create({
            name: req.body.name,
            created_by: user.id,
            capacity: req.body.capacity
        });
        await User.findByIdAndUpdate(req.user.id, { $push: { "teams": newTeam._id } });
        const updatedQuiz = await Quiz.findOneAndUpdate({ join_code: req.body.join_code }, {
            $push: { "scoreboard.teams": newTeam._id, "user_log": user._id },
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
