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

//Updateanje tima => samo tim lider, samo ime, ako je kviz u tijeku nema updateanja
exports.updateTeam = async function (req, res, next) {
    try {

        const team = await Team.findById(req.params.id);
        if (!team) return next(new ApiError("Tim ne postoji.", 404));
        if (req.user.id !== team.team_leader.toString()) return next(new ApiError("Samo vođa tima može uređivati tim.", 400));

        await Team.findByIdAndUpdate({ _id: req.params.id }, { name: req.body.name, capacity: req.body.capacity }, { runValidators: true, new: true })
        res.status(200).json({
            status: 'success',
            team
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
        if (req.user.id !== team.team_leader.toString()) return next(new ApiError("Samo vođa tima može izbrisati tim.", 400));

        else await Promise.all([
            User.updateMany({ team: team._id }, { is_in_team: false, is_currently_in_quiz: false, team: null }),
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
        if (userToInvite.is_in_team) return next(new ApiError(`Korisnik sa nadimkom ${req.body.username} već pripada nekom timu.`, 400));


        //3) Provjeri je li korisnik koji invitea u tim vođa
        if (req.user.id !== team.team_leader.toString()) return next(new ApiError('Samo vođa tima može slati pozivnice za tim.', 400));

        //4) Provjeri je li tim pun
        if (team.capacity === team.num_of_members) return next(new ApiError("Vaš tim je već popunjen.", 400));

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
        const checkInvitation = user.team_invitations.find(invitation => invitation.toString() === team._id.toString());

        if (!checkInvitation) return next(new ApiError("Ne možete se pridružiti ovom timu jer niste pozvani u njega.", 400));
        if (team.capacity === team.num_of_members) return next(new ApiError("Tim je popunjen.", 400));

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
        const team = await Team.findById(user.team).populate("team_members").select("name points_earned capacity num_of_members username");

        res.status(200).json({
            status: 'success',
            team
        })
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}
