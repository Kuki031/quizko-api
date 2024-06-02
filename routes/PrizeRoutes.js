'use strict'

const express = require('express');
const PrizeController = require('../controllers/PrizeController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const restrictQuizOps = require('../middlewares/restrictQuizOps');
const hasCreatedQuiz = require('../middlewares/hasCreatedQuiz');
const prizeRouter = express.Router();


prizeRouter.use(isLoggedIn, hasConfirmedEmail);
prizeRouter.route('/prizes/:id').get(PrizeController.getPrizesForQuiz);
prizeRouter.route('/prizes/new-prize/:id').patch(hasCreatedQuiz("id"), PrizeController.createPrize);
prizeRouter.route('/prizes/edit-prize/:prizeid').patch(restrictQuizOps(["prizeid"], ["prizes._id"]), PrizeController.editPrize);
prizeRouter.route('/prizes/delete-prize/:prizeid').patch(restrictQuizOps(["prizeid"], ["prizes._id"]), PrizeController.deletePrize);

module.exports = prizeRouter;
