'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const ApiError = require('../utils/ApiError');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Morate unjeti ime Vašeg tima."],
        unique: true
    },
    points_earned: {
        type: Number,
        default: 0
    },
    capacity: {
        type: Number,
        default: 4
    },
    num_of_members: {
        type: Number,
        default: 0
    },
    team_leader: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    team_members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    quiz: {
        type: mongoose.Schema.ObjectId,
        ref: 'Quiz'
    },
    is_in_quiz: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});
teamSchema.plugin(uniqueValidator);
teamSchema.pre('save', function (next) {
    this.num_of_members++;
    next();
})

teamSchema.methods.forbidTeamActions = async function (quizModel, team) {

    if (!team.is_in_quiz) return false;
    const currentQuiz = await quizModel.findOne({ "scoreboard.teams": team.id });
    const checkIfTeamInQuizCurrently = currentQuiz.scoreboard.teams.find(cq => cq.toString() === team._id.toString());
    return checkIfTeamInQuizCurrently && Date.now() >= currentQuiz.starts_at.getTime() && Date.now() < currentQuiz.ends_at.getTime();
}

teamSchema.methods.checkInvitation = function (user, team) {
    const checkIfAlreadyInvited = user.team_invitations.find(invitation => invitation.toString() === team._id.toString());
    return checkIfAlreadyInvited;
}

teamSchema.methods.restrictToLeader = (loggedUser, team) => loggedUser.id === team.team_leader.toString();
teamSchema.methods.checkCapacity = (team) => team.capacity === team.num_of_members;


const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
