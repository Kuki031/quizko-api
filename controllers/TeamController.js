'use strict'

const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');
const checkTeamState = require('../utils/checkTeamState');



exports.createTeam = async function (req, res, next) {
    try {

        const checkUser = await checkTeamState(User, req.user.id, true);
        if (checkUser) throw new ApiError("Već pripadate timu.", 400);

        const newTeam = await Team.create({
            name: req.body.name,
            created_by: req.user.id
        })

        await User.findByIdAndUpdate(req.user.id, { belongs_to_team: true, team: newTeam._id });

        res.status(201).json({
            status: 'success',
            newTeam
        });
    }
    catch (err) {
        return next(err);
    }
}

exports.getMyTeam = async function (req, res, next) {
    try {
        const checkUser = await checkTeamState(User, req.user.id, false);
        if (checkUser) throw new ApiError("Ne pripadate niti jednom timu.", 400);

        const team = await User.findById(req.user.id).populate("team").select("team");

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

        const checkUser = await checkTeamState(User, req.user.id, false);
        if (checkUser) throw new ApiError("Ne pripadate niti jednom timu.", 400);

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
        const checkUser = await checkTeamState(User, req.user.id, false);
        if (checkUser) throw new ApiError("Ne pripadate niti jednom timu.", 400);

        const team = await Team.findById(req.params.id);
        if (!req.user.hasCreatedTeam(req.user, team)) throw new ApiError("Niste kreirali ovaj tim, te ga ne možete obrisati.", 400);

        const teamId = req.params.id;

        await Promise.all([
            User.findByIdAndUpdate(req.user.id, { belongs_to_team: false, team: null }),
            Quiz.updateMany({ "scoreboard.teams": teamId }, {
                $pull: { "scoreboard.teams": teamId },
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

        const checkUser = await checkTeamState(User, req.user.id, false);
        if (checkUser) throw new ApiError("Ne pripadate niti jednom timu. Kako biste sudjelovali u kvizu, morate kreirati prvo tim.", 400);

        const user = await User.findById(req.user.id).populate("team");
        const teamToCheck = user.team.name;

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);

        if (quiz.hasReachedDeadline(quiz)) throw new ApiError("Rok za prijavu na kviz je istekao.", 400);

        const extractTeams = await quiz.scoreboard.populate("teams");
        const checkForDups = extractTeams.teams.find(x => x.name === teamToCheck);
        if (checkForDups) throw new ApiError(`Tim "${teamToCheck}" već postoji na bodovnoj ljestvici.`, 400);

        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, {
            $push: { "scoreboard.teams": req.user.team },
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

exports.leaveQuiz = async function (req, res, next) {
    try {

        const user = await User.findById(req.user.id).populate("team");
        const teamToCheck = user.team.name;

        const quiz = await Quiz.findById(req.params.id, { scoreboard: 1 });
        if (!quiz) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);

        const extractTeams = await quiz.scoreboard.populate("teams");
        const checkIfTeamInQuiz = extractTeams.teams.find(x => x.name === teamToCheck);
        if (!checkIfTeamInQuiz) throw new ApiError(`Tim "${teamToCheck}" ne postoji na bodovnoj ljestvici.`, 400);


        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, {
            $pull: { "scoreboard.teams": req.user.team },
            $inc: { "scoreboard.num_of_teams": -1 }
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