'use strict'

const express = require('express');
const quizController = require('../controllers/QuizController');
const userController = require('../controllers/UserController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');
const restrictQuizOps = require('../middlewares/restrictQuizOps');

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
quizRouter.route('/rounds/:id').get(quizController.getAllRoundsForQuiz);
quizRouter.route('/update-quiz/:id').patch(quizController.updateQuiz);
quizRouter.route('/delete-quiz/:id').delete(quizController.deleteQuiz);
quizRouter.route('/:id/new-round').post(quizController.createNewRoundForQuiz);

//Rounds
quizRouter.route('/edit-round/:roundid').patch(restrictQuizOps, quizController.editRoundForQuiz);
quizRouter.route('/delete-round/:roundid').patch(restrictQuizOps, quizController.deleteRoundForQuiz);
quizRouter.route('/round/:roundid').get(restrictQuizOps, quizController.getSingleRound);

//Questions for rounds
quizRouter.route('/new-question/:roundid').post(restrictQuizOps, quizController.newQuestion);
quizRouter.route('/edit-question/:questionid').patch(restrictQuizOps, quizController.editQuestion);
quizRouter.route('/delete-question/:questionid').patch(restrictQuizOps, quizController.deleteQuestion);
quizRouter.route('/round-questions/:roundid').get(restrictQuizOps, quizController.queryAllQuestionsFromRound);
quizRouter.route('/single-question/:questionid').get(restrictQuizOps, quizController.getSingleQuestion);

//Answers for questions
quizRouter.route('/new-answer/:questionid').post(restrictQuizOps, quizController.createNewAnswerForQuestion);
quizRouter.route('/edit-answer/:answerid/question/:questionid').patch(restrictQuizOps, quizController.editAnswer);
quizRouter.route('/delete-answer/:answerid/question/:questionid').patch(restrictQuizOps, quizController.deleteAnswer);
module.exports = quizRouter;

