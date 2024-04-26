'use strict'

const express = require('express');
const quizController = require('../controllers/QuizController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');
const quizRouter = express.Router();


quizRouter.use(isLoggedIn);
quizRouter.route('/all').get(quizController.getAllQuizzes);
quizRouter.route('/quiz/:id').get(quizController.getQuiz);


//quizRouter.use(restrictAccess);
quizRouter.route('/create-new-quiz').post(quizController.createQuiz);
quizRouter.route('/my-quizzes').get(quizController.getUserQuizzes);
quizRouter.route('/update-quiz/:id').patch(quizController.updateQuiz);
quizRouter.route('/delete-quiz/:id').delete(quizController.deleteQuiz);

module.exports = quizRouter;

