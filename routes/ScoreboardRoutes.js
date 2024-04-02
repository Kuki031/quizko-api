'use strict'

const express = require('express');
const scoreboardController = require('../controllers/ScoreboardController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');

const scoreboardRouter = express.Router();

scoreboardRouter.use(isLoggedIn);
scoreboardRouter.route('/scoreboard/:id').get(scoreboardController.getScoreboard);

scoreboardRouter.use(restrictAccess);
scoreboardRouter.route('/update-scoreboard/:id').patch(scoreboardController.updateTeamOnScoreboard);

module.exports = scoreboardRouter;