'use strict'

const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const questionRouter = express.Router();

const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');

questionRouter.use(isLoggedIn, restrictAccess);
questionRouter.route('/quiz/:quizid/round/:roundid').post(QuestionController.createQuestionForRound);
questionRouter.route('/edit-question/:id').patch(QuestionController.editQuestion);
questionRouter.route('/quiz/:quizid/questions/:roundid').get(QuestionController.getAllQuestionsFromRound);
questionRouter.route('/rounds/:id').get(QuestionController.getAllQuestionsAndRounds);
questionRouter.route('/delete-question/:id').delete(QuestionController.deleteQuestionFromRound);

///Answers///
questionRouter.route('/insert-answers/:id').post(QuestionController.createAnswer);
questionRouter.route('/answers/:id').get(QuestionController.getAnswersOfQuestion);
questionRouter.route('/:questionid/answer/:answerid').patch(QuestionController.editAnswers).delete(QuestionController.deleteAnswer);

module.exports = questionRouter;