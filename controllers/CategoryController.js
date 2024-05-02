'use strict'

const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');

exports.createCategory = async function (req, res, next) {
    try {
        const category = await Category.create({
            name: req.body.name
        });

        res.status(201).json({
            status: 'success',
            category
        })

    }
    catch (err) {
        return next(err);
    }
}


exports.getAllCategories = async function (req, res, next) {
    try {
        const categories = await Category.find({});
        res.status(200).json({
            status: 'success',
            categories
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.getSingleCategory = async function (req, res, next) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) throw new ApiError(`Kategorija sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(200).json({
            status: 'success',
            category
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.updateCategory = async function (req, res, next) {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { runValidators: true, new: true });
        if (!category) throw new ApiError(`Kategorija sa ID-em ${req.params.id} ne postoji.`, 404);

        res.status(200).json({
            status: 'success',
            category
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