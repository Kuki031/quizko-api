'use strict'

const express = require('express');
const TeamController = require('../controllers/TeamController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const checkUserTeamQuizState = require('../middlewares/checkUserTeamQuizState');


const teamRouter = express.Router();

teamRouter.use(isLoggedIn);
teamRouter.route('/new-team').post(checkUserTeamQuizState, TeamController.createTeam);
teamRouter.route('/my-team').get(TeamController.getMyTeam);
teamRouter.route('/all').get(TeamController.getAllTeams);
teamRouter.route('/update-team/:id').patch(TeamController.updateTeam);
teamRouter.route('/delete-team/:id').delete(TeamController.deleteTeam);
teamRouter.route('/invite-to-team/:id').patch(TeamController.inviteToTeam);
teamRouter.route('/join-team/:id').patch(checkUserTeamQuizState, TeamController.acceptTeamInvitation);
teamRouter.route('/leave-team/:id').patch(TeamController.leaveTeam);
teamRouter.route('/join-quiz/:id').patch(TeamController.joinQuiz);
teamRouter.route('/:id').get(TeamController.getTeam);

module.exports = teamRouter;