'use strict'

const express = require('express');
const PrizeController = require('../controllers/PrizeController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');
const prizeRouter = express.Router();


prizeRouter.use(isLoggedIn, restrictAccess);
prizeRouter.route('/prizes/:id').get(PrizeController.getPrizesForQuiz);
prizeRouter.route('/prizes/new-prize/:id').patch(PrizeController.createPrize);
prizeRouter.route('/prizes/edit-prize/:id').patch(PrizeController.editPrize);
prizeRouter.route('/prizes/delete-prize/:id').patch(PrizeController.deletePrize);

module.exports = prizeRouter;
