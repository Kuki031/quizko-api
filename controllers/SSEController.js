'use strict'

//1) Check if user is logged in (skip for now)
//2) Check if user is in quiz session (skip for now)
//3) Fetch quiz's questions from db
//4) Start emitting question with answers every 60 seconds
//5) In browser, change in url ?page={question_number}&limit=1
//6) Start live session ONLY when user joins quiz && quiz has been started by another user manually (API endpoint on quiz edit/quiz_started: true)
//7.) Save current user's state if page reloads

const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');
const Pagination = require('../utils/Pagination');

exports.getQuiz = async function (req, res, next) {
    try {
        const rounds = await Quiz.findById(req.params.id).select("rounds");
        if (!rounds) throw new ApiError("Kviz ne postoji.", 404);

        req.quiz = rounds;
        next();

    }
    catch (err) {
        return next(err);
    }
}


exports.prepareEmission = async function (req, res, next) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const quiz = req.quiz;
    const numOfRounds = req.quiz.rounds.length;

    let currentRound = 0;
    let currentQuestion = 0;

    const startEmission = function () {
        if (currentRound < numOfRounds) {
            const roundData = quiz.rounds[currentRound];
            if (currentQuestion < roundData.questions.length) {
                const questionData = roundData.questions[currentQuestion];
                const eventData = { round: roundData, question: questionData };
                res.write(`data: ${JSON.stringify(eventData)}\n\n`);
                res.flush();
                currentQuestion++;
            } else {
                currentRound++;
                currentQuestion = 0;
            }
        } else {
            clearInterval(interval);
        }
    };

    startEmission();
    //send new question every 5 seconds, change later
    const interval = setInterval(startEmission, 5000);

    req.on('close', () => {
        clearInterval(interval);
        console.log(`Client disconnected.`);
    });
};

