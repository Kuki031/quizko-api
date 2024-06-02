'use strict'

const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');
const checkTeamState = require('../utils/checkTeamState');

exports.createTeamQuizCreator = async function (req, res, next) {
    try {
        const checkUser = await User.findOne({ username: req.params.username });

        if (!checkUser) throw new ApiError(`Korisnik sa korisničkim imenom ${req.params.username} ne postoji.`, 404);
        if (checkUser.belongs_to_team) throw new ApiError(`Korisnik sa korisničkim imenom ${req.params.username} već pripada timu.`, 400);

        const newTeam = await Team.create({
            name: req.body.name,
            created_by: checkUser._id,
            capacity: req.body.capacity
        });

        await User.findByIdAndUpdate(req.params.id, { belongs_to_team: true, team: newTeam._id });

        res.status(201).json({
            status: 'success',
            newTeam
        })

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
            User.findByIdAndUpdate(req.user.id, { belongs_to_team: false, team: null, is_in_quiz: false, quiz_id: null }),
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

        let updatedQuiz;
        let newTeam;

        const getQuizByPassCode = await Quiz.findOne({ join_code: req.body.join_code });
        if (!getQuizByPassCode) throw new ApiError(`Kviz sa ovim kodom ne postoji ili je kod neispravan.`, 403);

        const user = await User.findById(req.user.id);

        if (user.quiz_id) {
            if (user.quiz_id.toString() === getQuizByPassCode._id.toString()) throw new ApiError(`Već ste prijavljeni na kviz ${getQuizByPassCode.name}.`, 400);
        }

        if (user.belongs_to_team) {
            const extractTeams = await getQuizByPassCode.scoreboard.populate("teams");
            const teamToCheck = await User.findById(req.user.id, { team: 1 }).populate("team");
            const checkForDups = extractTeams.teams.find(x => x.name === teamToCheck.team.name);
            if (checkForDups) throw new ApiError(`Tim "${teamToCheck.team.name}" već postoji na bodovnoj ljestvici.`, 400);
            await User.findByIdAndUpdate(req.user.id, { is_in_quiz: true, quiz_id: getQuizByPassCode._id });
            updatedQuiz = await Quiz.findOneAndUpdate({ join_code: req.body.join_code }, {
                $push: { "scoreboard.teams": user.team },
                $inc: { "scoreboard.num_of_teams": 1 }
            }, {
                runValidators: true,
                new: true
            });
        } else {
            newTeam = await Team.create({
                name: req.body.name,
                created_by: user.id,
                capacity: req.body.capacity
            });

            await User.findByIdAndUpdate(req.user.id, { belongs_to_team: true, team: newTeam._id, is_in_quiz: true, quiz_id: getQuizByPassCode._id });

            const extractTeams = await getQuizByPassCode.scoreboard.populate("teams");
            const teamToCheck = await User.findById(req.user.id, { team: 1 }).populate("team");
            const checkForDups = extractTeams.teams.find(x => x.name === teamToCheck.team.name);
            if (checkForDups) throw new ApiError(`Tim "${teamToCheck.team.name}" već postoji na bodovnoj ljestvici.`, 400);


            updatedQuiz = await Quiz.findOneAndUpdate({ join_code: req.body.join_code }, {
                $push: { "scoreboard.teams": newTeam._id },
                $inc: { "scoreboard.num_of_teams": 1 }
            }, {
                runValidators: true,
                new: true
            });
        }

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

        await User.findByIdAndUpdate(req.user.id, { is_in_quiz: false, quiz_id: null });

        res.status(200).json({
            status: 'success',
            updatedQuiz
        })

    }
    catch (err) {
        return next(err);
    }
}