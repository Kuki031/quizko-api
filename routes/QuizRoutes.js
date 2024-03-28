'use strict'

const express = require('express');
const quizController = require('../controllers/QuizController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');

const quizRouter = express.Router();



//Za sada samo admin
quizRouter.use(isLoggedIn);
quizRouter.route('/all').get(quizController.getAllQuizzes);
quizRouter.route('/quizzes-by-category').get(quizController.getQuizzesByCategories);
quizRouter.route('/quiz/:id').get(quizController.getQuiz);
//1) Spremi kvizove drugih
//2) Dohvati spremljene kvizove
//3) Obrisi spremljeni kviz


quizRouter.use(restrictAccess);
quizRouter.route('/create-new-quiz').post(quizController.createQuiz);
quizRouter.route('/my-quizzes').get(quizController.getUserQuizzes);
quizRouter.route('/update-quiz/:id').patch(quizController.updateQuiz);
quizRouter.route('/delete-quiz/:id').delete(quizController.deleteQuiz);



module.exports = quizRouter;

