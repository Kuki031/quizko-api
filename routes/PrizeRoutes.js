'use strict'

const express = require('express');
const cacheService = require("express-api-cache");
const cache = cacheService.cache;
const PrizeController = require('../controllers/PrizeController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const restrictQuizOps = require('../middlewares/restrictQuizOps');
const hasCreatedQuiz = require('../middlewares/hasCreatedQuiz');
const prizeRouter = express.Router();


prizeRouter.use(isLoggedIn, hasConfirmedEmail);
prizeRouter.route('/prizes/:id').get(cache("10 minutes"), PrizeController.getPrizesForQuiz);
prizeRouter.route('/prizes/new-prize/:id').patch(hasCreatedQuiz("id"), PrizeController.createPrize);
prizeRouter.route('/prizes/edit-prize/:prizeid').patch(restrictQuizOps(["prizeid"], ["prizes._id"]), PrizeController.editPrize);
prizeRouter.route('/prizes/delete-prize/:prizeid').patch(restrictQuizOps(["prizeid"], ["prizes._id"]), PrizeController.deletePrize);

module.exports = prizeRouter;
