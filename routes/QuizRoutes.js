'use strict'

const express = require('express');
const quizController = require('../controllers/QuizController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const prepareMulter = require('../middlewares/prepareMulter');
const resizeImage = require('../middlewares/resizeImage');
const quizRouter = express.Router();


quizRouter.use(isLoggedIn);
quizRouter.route('/all').get(quizController.getAllQuizzes);
quizRouter.route('/quiz/:id').get(quizController.getQuiz);

quizRouter.route('/create-new-quiz').post(prepareMulter, resizeImage(1024, 768), quizController.createQuiz);
quizRouter.route('/my-quizzes').get(quizController.getUserQuizzes);
quizRouter.route('/update-quiz/:id').patch(prepareMulter, resizeImage(1024, 768), quizController.updateQuiz);
quizRouter.route('/delete-quiz/:id').delete(quizController.deleteQuiz);

module.exports = quizRouter;

