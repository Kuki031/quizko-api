'use strict'

const express = require('express');
const quizController = require('../controllers/QuizController');
const userController = require('../controllers/UserController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');

const quizRouter = express.Router();



quizRouter.use(isLoggedIn);
quizRouter.route('/all').get(quizController.getAllQuizzes);
quizRouter.route('/quizzes-by-category').get(quizController.getQuizzesByCategories);
quizRouter.route('/save-quiz/:quizid').patch(userController.saveQuiz);
quizRouter.route('/saved-quizzes').get(userController.getSavedQuizzes);
quizRouter.route('/my-quizzes/delete-quiz/:quizid').delete(userController.deleteSavedQuiz);
quizRouter.route('/quiz/:id').get(quizController.getQuiz);



quizRouter.use(restrictAccess);
quizRouter.route('/create-new-quiz').post(quizController.createQuiz);
quizRouter.route('/my-quizzes').get(quizController.getUserQuizzes);
quizRouter.route('/update-quiz/:id').patch(quizController.updateQuiz);
quizRouter.route('/delete-quiz/:id').delete(quizController.deleteQuiz);



module.exports = quizRouter;

