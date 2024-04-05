'use strict'

const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const ApiFeatures = require('../utils/ApiFeatures');
const ApiError = require('../utils/ApiError');


//Kreiraj pitanje za rundu u kvizu
exports.createQuestionForRound = async function (req, res, next) {
    try {

        const { quizid, roundid } = req.params;
        const quiz = await Quiz.findById(quizid);

        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Niste kreirali ovaj kviz, s toga ne možete kreirati pitanje za ovaj kviz.", 403);

        const newQuestion = await Question.create({
            name: req.body.name,
            num_of_points: req.body.num_of_points,
            time_to_answer: req.body.time_to_answer
        });

        const targetRound = quiz.rounds.find(round => round.id === roundid);
        if (!targetRound) throw new ApiError("Runda za kviz ne postoji.", 404);

        targetRound.questions.push(newQuestion.id);
        targetRound.num_of_questions++;
        await quiz.save();

        res.status(201).json({
            status: 'success',
            newQuestion
        })

    }
    catch (err) {
        if (err.name === 'ValidationError') return next(new ApiError("Pitanje već postoji.", 400));
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

//Uredi pitanje (time_to_answer, name, num_of_points)
exports.editQuestion = async function (req, res, next) {
    try {
        const editQuestion = await Question.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            time_to_answer: req.body.time_to_answer,
            num_of_points: req.body.num_of_points
        }, { runValidators: true, new: true });

        res.status(200).json({
            status: 'success',
            editQuestion
        })
    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

//Dohvati sva pitanja iz neke runde
exports.getAllQuestionsFromRound = async function (req, res, next) {
    try {
        const { quizid, roundid } = req.params;
        const quiz = await Quiz.findById(quizid);

        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);
        const targetRound = quiz.rounds.find(round => round.id === roundid);

        if (!targetRound) throw new ApiError("Runda ne postoji.", 404);
        const populateRoundQuestions = targetRound.questions;

        const roundQuestions = await Question.find({ _id: { $in: populateRoundQuestions } });

        res.status(200).json({
            status: 'success',
            roundQuestions
        })
    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

//Dohvati sve runde iz kviza i popuni ih pitanjima
exports.getAllQuestionsAndRounds = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);

        const populateQuery = await Quiz.populate(quiz.rounds, { path: 'questions', });

        res.status(200).json({
            status: 'success',
            data: populateQuery
        });
    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

//Izbriši pitanje
exports.deleteQuestionFromRound = async function (req, res, next) {
    try {

        await Question.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        })

    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

////////////////////Answers/////////////////
//Kreiraj odgovor za pitanje
exports.createAnswer = async function (req, res, next) {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        question.answers.push({
            answer: req.body.answer,
            is_correct: req.body.is_correct
        });
        await question.save({ validateModifiedOnly: true });

        res.status(201).json({
            status: 'success',
            question
        })
    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

//Dohvati sve odgovore za neko pitanje
exports.getAnswersOfQuestion = async function (req, res, next) {
    try {
        const answers = await Question.findById(req.params.id).select("answers");
        res.status(200).json({
            status: 'success',
            answers
        })
    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

//Uredi odgovore za neko pitanje
exports.editAnswers = async function (req, res, next) {
    try {
        const { questionid, answerid } = req.params;

        const question = await Question.findById(questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        const matchAnswer = question.answers.find(answer => answer.id === answerid);
        if (!matchAnswer) throw new ApiError("Odgovor ne postoji.", 404);

        matchAnswer.answer = req.body.answer;
        matchAnswer.is_correct = req.body.is_correct;

        await question.save({ validateModifiedOnly: true });

        res.status(200).json({
            status: 'success',
            question
        })

    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}

//Obrisi odgovor iz pitanja
exports.deleteAnswer = async function (req, res, next) {
    try {
        const { questionid, answerid } = req.params;

        const question = await Question.findById(questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        const matchAnswer = question.answers.find(answer => answer.id === answerid);
        if (!matchAnswer) throw new ApiError("Odgovor ne postoji.", 404);

        await Question.findByIdAndUpdate(questionid, { $pull: { answers: { _id: answerid } } })

        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        if (err.statusCode === undefined) return next(new ApiError("Nešto nije u redu.", 500));
        return next(err);
    }
}