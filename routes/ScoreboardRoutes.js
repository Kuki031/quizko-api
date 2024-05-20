'use strict'

const express = require('express');
const cacheService = require("express-api-cache");
const cache = cacheService.cache;
const scoreboardController = require('../controllers/ScoreboardController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const hasCreatedQuiz = require('../middlewares/hasCreatedQuiz');

const scoreboardRouter = express.Router();

scoreboardRouter.use(isLoggedIn, hasConfirmedEmail);
scoreboardRouter.route('/scoreboard/:id').get(cache("1 minute"), scoreboardController.getScoreboard);
scoreboardRouter.route('/update-scoreboard/:quizid/:teamid').patch(hasCreatedQuiz("quizid"), scoreboardController.updateTeamOnScoreboard);
scoreboardRouter.route('/manually-add-team/:scoreboard/team/:team').patch(hasCreatedQuiz("scoreboard"), scoreboardController.addTeamOnScoreboardManually);


module.exports = scoreboardRouter;