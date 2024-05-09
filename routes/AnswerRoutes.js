'use strict'

const express = require('express');
const AnswerController = require('../controllers/AnswerController');
const restrictQuizOps = require('../middlewares/restrictQuizOps');
const restrictAccess = require('../middlewares/restrictAccess');
const isLoggedIn = require('../middlewares/isLoggedIn');
const answerRouter = express.Router();

answerRouter.use(isLoggedIn);

//Answers for questions
answerRouter.route('/new-answer/:questionid').post(restrictQuizOps(["questionid"], ["rounds.questions._id"]), AnswerController.createNewAnswerForQuestion);
answerRouter.route('/edit-answer/:answerid/question/:questionid').patch(restrictQuizOps(["answerid", "questionid"], ["rounds.questions._id", "rounds.questions.answers._id"]), AnswerController.editAnswer);
answerRouter.route('/delete-answer/:answerid/question/:questionid').patch(restrictQuizOps(["answerid", "questionid"], ["rounds.questions._id", "rounds.questions.answers._id"]), AnswerController.deleteAnswer);


module.exports = answerRouter;
