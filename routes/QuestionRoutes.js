'use strict'

const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const restrictQuizOps = require('../middlewares/restrictQuizOps');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const isLoggedIn = require('../middlewares/isLoggedIn');
const prepareMulter = require('../middlewares/prepareMulter');
const resizeImage = require('../middlewares/resizeImage');
const questionRouter = express.Router();

questionRouter.use(isLoggedIn, hasConfirmedEmail);
questionRouter.route('/new-question/:roundid').post(restrictQuizOps(["roundid"], ["rounds._id"]), prepareMulter, resizeImage(1024, 768, 'question'), QuestionController.newQuestion);
questionRouter.route('/edit-question/:questionid').patch(restrictQuizOps(["questionid"], ["rounds.questions._id"]), prepareMulter, resizeImage(1024, 768, 'question'), QuestionController.editQuestion);
questionRouter.route('/delete-question/:questionid').patch(restrictQuizOps(["questionid"], ["rounds.questions._id"]), QuestionController.deleteQuestion);
questionRouter.route('/round-questions/:roundid').get(restrictQuizOps(["roundid"], ["rounds._id"]), QuestionController.queryAllQuestionsFromRound);
questionRouter.route('/single-question/:questionid').get(restrictQuizOps(["questionid"], ["rounds.questions._id"]), QuestionController.getSingleQuestion);

module.exports = questionRouter;
