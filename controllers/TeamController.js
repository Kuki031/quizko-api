'use strict'

const Quiz = require('../models/Quiz');
const Team = require('../models/Team');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');


// Korisnik kreira tim (mora bit logiran, ne smije pripadat timu, ne smije pripadat kvizu)
exports.createTeam = async function (req, res, next) {
    try {
        const team = await Team.create({
            name: req.body.name,
            capacity: req.body.capacity,
            team_leader: req.user.id
        });

        await User.updateOne({ _id: req.user.id }, { is_in_team: true, team: team._id });

        res.status(201).json({
            status: 'success',
            team
        })
    }
    catch (err) {
        if (err.name === 'ValidationError') return next(new ApiError(err.message, 400));
        if (err.name === 'DuplicateKeyError') return next(new ApiError(err.message, 400));
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

exports.getAllTeams = async function (req, res, next) {
    try {
        const teams = await Team.find().populate('team_leader', "username");
        res.status(200).json({
            status: 'success',
            teams
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}


exports.getTeam = async function (req, res, next) {
    try {
        const team = await Team.findById(req.params.id).populate("team_leader", "username");
        if (!team) return next(new ApiError("Tim ne postoji.", 404));

        res.status(200).json({
            status: 'success',
            team
        })
    }
    catch (err) {
        if (err.name === 'ValidationError') return next(new ApiError(err.message, 400));
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

//Updateanje tima => samo tim lider, samo ime i kapacitet, ako je kviz u tijeku nema updateanja
exports.updateTeam = async function (req, res, next) {
    try {

        const team = await Team.findById(req.params.id);
        if (!team) return next(new ApiError("Tim ne postoji.", 404));
        if (!team.restrictToLeader(req.user, team)) return next(new ApiError("Ne možete uređivati tim jer niste vođa tima.", 403));

        const check = await team.forbidTeamActions(Quiz, team);
        if (check) return next(new ApiError("Ne možete uređivati tim dokle god je Vaš tim u trenutno aktivnom kvizu.", 400));

        const updatedTeam = await Team.findByIdAndUpdate(req.params.id, { name: req.body.name, capacity: req.body.capacity }, { runValidators: true, new: true })
        res.status(200).json({
            status: 'success',
            updatedTeam
        })
    }
    catch (err) {
        if (err.name === 'CastError') return next(new ApiError(err.message, 400));
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

//Samo tim lider, nema brisanja tima dok je kviz u tijeku (ako obrise tim, state is_in_team svih usera postaje false i makne im se team)
exports.deleteTeam = async function (req, res, next) {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) return next(new ApiError("Tim ne postoji.", 404));
        if (!team.restrictToLeader(req.user, team)) return next(new ApiError("Ne možete obrisati tim jer niste vođa tima.", 403));

        const check = await team.forbidTeamActions(Quiz, team);
        if (check) return next(new ApiError("Kviz je trenutno u tijeku, ne možete izbrisati tim.", 400));


        else await Promise.all([
            User.updateMany({ team: team._id }, { is_in_team: false, is_currently_in_quiz: false, team: null }),
            Quiz.findOneAndUpdate({ "scoreboard.teams": team.id }, {
                $pull: { "scoreboard.teams": team.id },
                $inc: { "scoreboard.num_of_teams": -1 }
            }),
            Team.findByIdAndDelete(req.params.id)
        ])

        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

//Samo tim lider moze inviteat druge u tim (preko username-a)
exports.inviteToTeam = async function (req, res, next) {
    try {

        //1) Dohvati svoj tim po imenu
        const team = await Team.findOne({ _id: req.params.id });
        if (!team) return next(new ApiError(`Tim sa ID-em ${req.params.id} ne postoji.`, 404));

        //2) Dohvati korisnika kojeg treba dodat
        const userToInvite = await User.findOne({ username: req.body.username });
        if (!userToInvite) return next(new ApiError(`Korisnik sa nadimkom ${req.body.username} ne postoji.`, 404));
        if (userToInvite.belongsToTeam(userToInvite)) return next(new ApiError(`Korisnik sa nadimkom ${req.body.username} već pripada nekom timu.`, 400));


        //2.1.) Provjeri je li korisnik već pozvan u ovaj tim
        const checkIfAlreadyInvited = team.checkInvitation(userToInvite, team);
        if (checkIfAlreadyInvited) return next(new ApiError(`Već ste pozvali korisnika ${userToInvite.username} u Vaš tim.`, 400));


        //3) Provjeri je li korisnik koji invitea u tim vođa
        if (!team.restrictToLeader(req.user, team)) return next(new ApiError('Samo vođa tima može slati pozivnice za tim.', 400));

        //4) Provjeri je li tim pun
        if (team.checkCapacity(team)) return next(new ApiError("Vaš tim je već popunjen.", 400));

        //5) Posalji invite korisniku
        await User.findOneAndUpdate({ username: userToInvite.username }, {
            $push: { team_invitations: team._id }
        });

        res.status(200).json({
            status: 'success',
            message: `Poslali ste pozivnicu za pridruživanje timu korisniku ${userToInvite.username}.`
        });

    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

exports.acceptTeamInvitation = async function (req, res, next) {
    try {

        const team = await Team.findById(req.params.id);
        if (!team) return next(new ApiError(`Tim sa ID-em ${req.params.id} ne postoji.`, 404));

        const user = await User.findById(req.user.id);
        const checkIfInvited = team.checkInvitation(user, team);
        if (!checkIfInvited) return next(new ApiError("Ne možete se pridružiti ovom timu jer niste pozvani u njega.", 400));


        if (team.checkCapacity(team)) return next(new ApiError("Tim je popunjen.", 400));

        const check = await team.forbidTeamActions(Quiz, team);
        if (check) return next(new ApiError("Ne možete se priključiti ovom timu, jer je tim u kvizu koji je u tijeku.", 400));

        await Promise.all([
            Team.findByIdAndUpdate(req.params.id, { $push: { team_members: req.user.id }, $inc: { num_of_members: 1 } }),
            User.findByIdAndUpdate(req.user.id, {
                is_in_team: true, team: req.params.id,
                $pull: { team_invitations: req.params.id }
            }, { runValidators: true, new: true })
        ])

        res.status(200).json({
            status: 'success',
            message: `Pridružili ste se timu ${team.name}.`
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

exports.leaveTeam = async function (req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user.is_in_team) return next(new ApiError("Niste ni u jednom timu.", 400));
        const team = await Team.findById(req.params.id);

        if (!team) return next(new ApiError("Tim ne postoji.", 404));
        if (user.id === team.team_leader.toString()) return next(new ApiError("Kao vođa tima ne možete izaći iz tima, možete ga samo obrisati.", 400));

        const check = await team.forbidTeamActions(Quiz, team);
        if (check) return next(new ApiError("Ne možete izaći iz tima, jer je tim u kvizu koji je u tijeku.", 400));

        await Promise.all([
            User.findByIdAndUpdate(req.user.id, { is_in_team: false, is_currently_in_quiz: false, team: null }, { runValidators: true, new: true }),
            Team.findByIdAndUpdate(req.params.id, { $inc: { num_of_members: -1 }, $pull: { team_members: user._id } })
        ]);

        res.status(200).json({
            status: 'success',
            message: `Napustili ste tim ${team.name}.`
        });
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}



exports.getMyTeam = async function (req, res, next) {
    try {

        const user = await User.findById(req.user.id).select("team");
        if (!user.team) return next(new ApiError("Ne pripadate niti jednom timu.", 400));
        const team = await Team.findById(user.team).populate("team_members");

        res.status(200).json({
            status: 'success',
            team
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

exports.joinQuiz = async function (req, res, next) {
    try {

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return next(new ApiError("Kviz ne postoji.", 404));
        if (!req.user.belongsToTeam(req.user)) return next(new ApiError("Ne pripadate ni jednom timu, te se ne možete prijaviti na kviz. Kreirajte svoj tim ili uđite u nečiji tim kako biste mogli sudjelovati.", 400));


        if (quiz.hasReachedDeadline(quiz)) return next(new ApiError("Rok za prijavu na kviz je završio.", 400));
        if (req.user.isInActiveQuiz(req.user)) return next(new ApiError("Već ste prijavljeni na kviz.", 400));

        if (req.user.belongsToTeam(req.user)) {
            const team = await Team.findById(req.user.team);
            if (!team.restrictToLeader(req.user, team)) return next(new ApiError("Samo vođa tima može prijaviti Vaš tim na kviz.", 403));


            await Promise.all([
                User.updateMany({ team: team._id }, { is_currently_in_quiz: true }),
                Quiz.findByIdAndUpdate(req.params.id, {
                    $push: { "scoreboard.teams": team.id },
                    $inc: { "scoreboard.num_of_teams": 1 }
                }),
                Team.findByIdAndUpdate(team.id, { is_in_quiz: true })
            ])
        }

        res.status(200).json({
            status: 'success',
            message: `Pridružili ste se kvizu ${quiz.name}. Kviz poćinje na sljedeći datum: ${quiz.starts_at}`
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}