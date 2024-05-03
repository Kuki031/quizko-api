'use strict'

const sharp = require('sharp');
const multer = require('multer');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const Pagination = require('../utils/Pagination');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }
});


exports.createQuiz = async function (req, res, next) {
    try {
        upload.single('image')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return next(new ApiError("Greška prilikom učitavanja slike.", 400));
            } else if (err) {
                return next(new ApiError("Nešto nije u redu.", 500));
            }

            if (!req.file) {
                return next(new ApiError("Niste odabrali sliku.", 400));
            }

            try {
                const resizedImageBuffer = await sharp(req.file.buffer)
                    .resize({ width: 640, height: 360 })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                const imageData = {
                    data: resizedImageBuffer,
                    contentType: 'image/jpg'
                };

                const quiz = await Quiz.create({
                    name: req.body.name,
                    description: req.body.description,
                    category: req.body.category,
                    prizes: req.body.prizes,
                    num_of_rounds: req.body.num_of_rounds,
                    date_to_signup: req.body.date_to_signup,
                    created_by: req.user.id,
                    scoreboard: {
                        name: `${req.body.name} - bodovna ljestvica`
                    },
                    image: imageData
                });

                await User.findByIdAndUpdate(req.user.id, {
                    $push: { saved_quizzes: quiz.id }
                });

                res.status(201).json({
                    status: 'success',
                    quiz
                });

            } catch (err) {
                return next(err);
            }
        });

    } catch (err) {
        return next(err);
    }
}

exports.getQuiz = async function (req, res, next) {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('category')
            .select('+image');

        if (!quiz) {
            throw new ApiError(`Kviz sa ID-em ${req.params.id} ne postoji.`, 404);
        }

        res.status(200).json({
            status: 'success',
            quiz
        });
    } catch (err) {
        return next(err);
    }
}


exports.getAllQuizzes = async function (req, res, next) {
    try {
        const quizzes = await Quiz.find().populate("category");
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

        const { page, limit, skip } = Pagination(req.query.page, req.query.limit);

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
