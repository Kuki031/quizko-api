'use strict'

const express = require('express');
const TeamController = require('../controllers/TeamController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const TeamRouter = express.Router();


TeamRouter.use(isLoggedIn, hasConfirmedEmail);
TeamRouter.route('/new-team').post(TeamController.createTeam);
TeamRouter.route('/my-team').get(TeamController.getMyTeam);
TeamRouter.route('/join-quiz/:id').patch(TeamController.joinQuiz);
TeamRouter.route('/leave-quiz/:id').patch(TeamController.leaveQuiz);
TeamRouter.route('/update-my-team/:id').patch(TeamController.updateMyTeam);
TeamRouter.route('/delete-my-team/:id').delete(TeamController.deleteMyTeam);


module.exports = TeamRouter;
