'use strict'

const Quiz = require('../models/Quiz');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

exports.createQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.create({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            is_locked: req.body.is_locked,
            starts_at: req.body.starts_at,
            num_of_rounds: req.body.num_of_rounds,
            ends_at: req.body.ends_at,
            date_to_signup: req.body.date_to_signup,
            created_by: req.user.id,
            scoreboard: {
                name: `${req.body.name}-scoreboard`
            }
        });
        await User.findByIdAndUpdate(req.user.id, {
            $push: { saved_quizzes: quiz.id }
        })
        res.status(201).json({
            status: 'success',
            quiz
        })

    }
    catch (err) {
        return next(err);
    }
}

exports.getQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id).populate("category");
        if (!quiz) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(200).json({
            status: 'success',
            quiz
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.getAllQuizzes = async function (req, res, next) {
    try {
        const quizzes = await Quiz.find();
        res.status(200).json({
            status: 'success',
            quizzes
        })
    }
    catch (err) {
        return next(err);
    }
}


exports.updateQuiz = async function (req, res, next) {
    try {

        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true,
            new: true
        });
        if (!quiz) throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Ne možete pristupiti ovoj lokaciji.", 403);


        res.status(200).json({
            status: 'success',
            quiz
        })

    }
    catch (err) {
        return next(err);
    }
}


exports.deleteQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id)
        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Ne možete pristupiti ovoj lokaciji.", 403);


        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.getUserQuizzes = async function (req, res, next) {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const quizzes = await Quiz.find({ created_by: req.user.id });
        const quizzesP = quizzes;
        const paginatedQuizzes = quizzesP.slice(skip, skip + limit);
        res.status(200).json({
            status: 'success',
            paginatedQuizzes
        })
    }
    catch (err) {
        return next(err);
    }
}


exports.getQuizzesByCategories = async function (req, res, next) {
    try {
        const quizzesByCategory = await Quiz.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"
            },
            {
                $group: {
                    _id: { category: "$categoryDetails.name" },
                    numOfQuizzes: { $count: {} },
                    quizzes: { $push: { quiz: "$name" } }
                }
            },
            {
                $sort: { numOfQuizzes: -1 }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                quizzesByCategory
            }
        });
    }
    catch (err) {
        return next(err);
    }
};

//Runde
exports.createNewRoundForQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new ApiError("Kviz ne postoji.", 404);
        if (!req.user.hasCreatedQuiz(req.user, quiz)) throw new ApiError("Niste kreirali ovaj kviz.", 403);

        const checkDuplicate = quiz.rounds.find(round => round.name === req.body.name);
        if (checkDuplicate) throw new ApiError(`Runda "${req.body.name}" već postoji.`, 400);
        if (quiz.rounds.length === quiz.num_of_rounds) throw new ApiError("Dosegnut kapacitet broja rundi u kvizu.", 400);

        else quiz.rounds.push({
            name: req.body.name,
            num_of_questions: req.body.num_of_questions
        });

        await quiz.save();

        res.status(201).json({
            status: 'success',
            round: req.body.name
        })
    }

    catch (err) {
        return next(err);
    }
}

//Uredi rundu (samo ime)
exports.editRoundForQuiz = async function (req, res, next) {
    try {

        const round = await Quiz.findOneAndUpdate(
            { "rounds._id": req.params.roundid },
            { $set: { "rounds.$.name": req.body.name, "rounds.$.num_of_questions": req.body.num_of_questions } },
            { runValidators: true, new: true }
        );

        if (!round) throw new ApiError("Runda za kviz ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            round
        })
    }
    catch (err) {
        return next(err);
    }
}

//Izbrisi rundu
exports.deleteRoundForQuiz = async function (req, res, next) {
    try {
        const round = await Quiz.findOneAndUpdate(
            { "rounds._id": req.params.roundid },
            { $pull: { rounds: { _id: req.params.roundid } } },
        );

        if (!round) throw new ApiError("Runda za kviz ne postoji.", 404);

        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        return next(err);
    }
}

//Dohvati sve runde i populate pitanja za kviz
exports.getAllRoundsForQuiz = async function (req, res, next) {
    try {
        const rounds = await Quiz.findById(req.params.id).select("rounds");

        if (!rounds) throw new ApiError("Kviz ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            rounds
        });
    }
    catch (err) {
        return next(err);
    }
}

//Dohvati jednu rundu
exports.getSingleRound = async function (req, res, next) {
    try {

        const round = await Quiz.findOne({ "rounds._id": req.params.roundid }, { "rounds.$": 1 })

        if (!round) throw new ApiError("Runda ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            round
        })
    }
    catch (err) {
        return next(err);
    }
}


//Questions
exports.newQuestion = async function (req, res, next) {
    try {
        const round = await Quiz.findOne({ "rounds._id": req.params.roundid }, { "rounds.$": 1 });
        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const checkDuplicate = round.rounds[0].questions.find(question => question.name === req.body.name);
        if (checkDuplicate) throw new ApiError(`Pitanje "${req.body.name}" već postoji.`, 400);

        if (round.rounds[0].num_of_questions === round.rounds[0].questions.length) throw new ApiError("Dosegnut kapacitet broja pitanja u rundi.", 400);


        const newQuestion = await Quiz.findOneAndUpdate(
            { "rounds._id": req.params.roundid },
            { $push: { "rounds.$.questions": { "name": req.body.name, "num_of_points": req.body.num_of_points, "num_of_answers": req.body.num_of_answers } } },
            { runValidators: true, new: true }
        );


        res.status(201).json({
            status: 'success',
            newQuestion
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.editQuestion = async function (req, res, next) {
    try {
        const question = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            {
                $set: {
                    "rounds.$[outer].questions.$[inner].name": req.body.name,
                    "rounds.$[outer].questions.$[inner].num_of_points": req.body.num_of_points,
                    "rounds.$[outer].questions.$[inner].num_of_answers": req.body.num_of_answers
                }
            },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                    { "inner._id": req.params.questionid }
                ],
                runValidators: true,
                new: true
            }
        );

        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            question
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.deleteQuestion = async function (req, res, next) {
    try {
        const question = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            {
                $pull: {
                    "rounds.$[outer].questions": { _id: req.params.questionid },
                }
            },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                ],
                new: true
            }
        );

        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(204).json({
            status: 'success',
            question
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.queryAllQuestionsFromRound = async function (req, res, next) {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const round = await Quiz.findOne(
            { "rounds._id": req.params.roundid },
            { "rounds.$": 1 }
        );

        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const questions = round.rounds[0].questions;
        const paginatedQuestions = questions.slice(skip, skip + limit);

        res.status(200).json({
            status: 'success',
            currentPage: page,
            totalQuestions: questions.length,
            questions: paginatedQuestions
        });
    }
    catch (err) {
        return next(err);
    }
}

exports.getSingleQuestion = async function (req, res, next) {
    try {
        const round = await Quiz.findOne({ "rounds.questions._id": req.params.questionid }, { "rounds.$": 1 });

        if (!round) throw new ApiError("Runda ne postoji.", 404);
        const questions = round.rounds[0].questions;
        const question = questions.find(q => q._id.toString() === req.params.questionid);

        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(200).json({
            status: 'success',
            question
        })

    }
    catch (err) {
        return next(err);
    }
}

//Answers
exports.createNewAnswerForQuestion = async function (req, res, next) {
    try {
        const answerExists = await Quiz.exists({
            "rounds.questions._id": req.params.questionid,
            "rounds.questions.answers": {
                $elemMatch: {
                    answer: req.body.answer,
                    is_correct: req.body.is_correct
                }
            }
        });

        if (answerExists) throw new ApiError("Odgovor već postoji.", 400);


        const quiz = await Quiz.findOne({ "rounds.questions._id": req.params.questionid });
        if (!quiz) throw new ApiError("Pitanje ne postoji.", 404);


        const round = quiz.rounds.find(round => round.questions.some(q => q._id.toString() === req.params.questionid));
        if (!round) throw new ApiError("Runda ne postoji.", 404);


        const question = round.questions.find(q => q._id.toString() === req.params.questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);


        if (question.answers.length >= question.num_of_answers) throw new ApiError("Dosegnuli ste kapacitet broja odgovora u pitanju.", 400);


        const updatedQuiz = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            {
                $push: {
                    "rounds.$.questions.$[inner].answers": {
                        answer: req.body.answer,
                        is_correct: req.body.is_correct
                    }
                }
            },
            {
                arrayFilters: [{ "inner._id": req.params.questionid }],
                new: true
            }
        );

        const newAnswer = question.answers.find(answer => answer.answer === req.body.answer && answer.is_correct === req.body.is_correct);

        res.status(201).json({
            status: 'success',
            message: "Odgovor kreiran."
        });
    } catch (err) {
        return next(err);
    }
};


exports.editAnswer = async function (req, res, next) {
    try {
        const updatedQuiz = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid, "rounds.questions.answers._id": req.params.answerid },
            {
                $set: {
                    "rounds.$[outer].questions.$[inner].answers.$[answer].answer": req.body.answer,
                    "rounds.$[outer].questions.$[inner].answers.$[answer].is_correct": req.body.is_correct
                }
            },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                    { "inner._id": req.params.questionid },
                    { "answer._id": req.params.answerid }
                ],
                new: true
            }
        );

        if (!updatedQuiz) throw new ApiError("Traženi odgovor na ovo pitanje ne postoji.", 404);

        const round = updatedQuiz.rounds.find(round => round.questions.some(q => q._id.toString() === req.params.questionid));
        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const question = round.questions.find(q => q._id.toString() === req.params.questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        const updatedAnswer = question.answers.find(answer => answer._id.toString() === req.params.answerid);

        res.status(200).json({
            status: 'success',
            answer: updatedAnswer
        });
    } catch (err) {
        return next(err);
    }
}

exports.deleteAnswer = async function (req, res, next) {
    try {
        const updatedQuiz = await Quiz.findOneAndUpdate(
            { "rounds.questions._id": req.params.questionid },
            { $pull: { "rounds.$[outer].questions.$[inner].answers": { _id: req.params.answerid } } },
            {
                arrayFilters: [
                    { "outer.questions._id": req.params.questionid },
                    { "inner._id": req.params.questionid }
                ],
                new: true
            }
        );

        if (!updatedQuiz) throw new ApiError("Traženi odgovor na ovo pitanje ne postoji.", 404);

        const round = updatedQuiz.rounds.find(round => round.questions.some(q => q._id.toString() === req.params.questionid));
        if (!round) throw new ApiError("Runda ne postoji.", 404);

        const question = round.questions.find(q => q._id.toString() === req.params.questionid);
        if (!question) throw new ApiError("Pitanje ne postoji.", 404);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        return next(err);
    }
}