'use strict'

const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const restrictQuizOps = require('../middlewares/restrictQuizOps');
const restrictAccess = require('../middlewares/restrictAccess');
const isLoggedIn = require('../middlewares/isLoggedIn');
const questionRouter = express.Router();

questionRouter.use(isLoggedIn, restrictAccess);
questionRouter.route('/new-question/:roundid').post(restrictQuizOps(["roundid"], ["rounds._id"]), QuestionController.newQuestion);
questionRouter.route('/edit-question/:questionid').patch(restrictQuizOps(["questionid"], ["rounds.questions._id"]), QuestionController.editQuestion);
questionRouter.route('/delete-question/:questionid').patch(restrictQuizOps(["questionid"], ["rounds.questions._id"]), QuestionController.deleteQuestion);
questionRouter.route('/round-questions/:roundid').get(restrictQuizOps(["roundid"], ["rounds._id"]), QuestionController.queryAllQuestionsFromRound);
questionRouter.route('/single-question/:questionid').get(restrictQuizOps(["questionid"], ["rounds.questions._id"]), QuestionController.getSingleQuestion);

module.exports = questionRouter;