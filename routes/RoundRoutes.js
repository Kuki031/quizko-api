'use strict'

const express = require('express');
const RoundController = require('../controllers/RoundController');
const restrictQuizOps = require('../middlewares/restrictQuizOps');
const restrictAccess = require('../middlewares/restrictAccess');
const isLoggedIn = require('../middlewares/isLoggedIn');
const roundRouter = express.Router();


roundRouter.use(isLoggedIn, restrictAccess);
roundRouter.route('/rounds/:id').get(RoundController.getAllRoundsForQuiz);
roundRouter.route('/:id/new-round').post(RoundController.createNewRoundForQuiz);
roundRouter.route('/edit-round/:roundid').patch(restrictQuizOps(["roundid"], ["rounds._id"]), RoundController.editRoundForQuiz);
roundRouter.route('/delete-round/:roundid').patch(restrictQuizOps(["roundid"], ["rounds._id"]), RoundController.deleteRoundForQuiz);
roundRouter.route('/round/:roundid').get(restrictQuizOps(["roundid"], ["rounds._id"]), RoundController.getSingleRound);


module.exports = roundRouter;