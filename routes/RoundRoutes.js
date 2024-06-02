'use strict'

const express = require('express');
const RoundController = require('../controllers/RoundController');
const restrictQuizOps = require('../middlewares/restrictQuizOps');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const hasCreatedQuiz = require('../middlewares/hasCreatedQuiz');
const roundRouter = express.Router();


roundRouter.use(isLoggedIn, hasConfirmedEmail);
roundRouter.route('/rounds/:id').get(RoundController.getAllRoundsForQuiz);
roundRouter.route('/:id/new-round').post(hasCreatedQuiz("id"), RoundController.createNewRoundForQuiz);
roundRouter.route('/edit-round/:roundid').patch(restrictQuizOps(["roundid"], ["rounds._id"]), RoundController.editRoundForQuiz);
roundRouter.route('/delete-round/:roundid').patch(restrictQuizOps(["roundid"], ["rounds._id"]), RoundController.deleteRoundForQuiz);
roundRouter.route('/round/:roundid').get(restrictQuizOps(["roundid"], ["rounds._id"]), RoundController.getSingleRound);


module.exports = roundRouter;
