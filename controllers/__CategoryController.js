// 'use strict'

// const Category = require('../models/Category');
// const ApiError = require('../utils/ApiError');



// // Create category
// exports.createCategory = async function (req, res, next) {
//     try {

//         const category = await Category.create({
//             name: req.body.name
//         })
//         res.status(201).json({
//             status: 'success',
//             category
//         })

//     }
//     catch (err) {
//         return next(err);
//     }
// }

// // Get single category
// exports.getCategory = async function (req, res, next) {
//     try {
//         const category = await Category.findById(req.params.id);
//         if (!category) throw new ApiError(`Kategorija sa ID-em ${req.params.id} ne postoji!`, 404);

//         res.status(200).json({
//             status: 'success',
//             category
//         })
//     }
//     catch (err) {
//         return next(err);
//     }
// }

// // Get all categories
// exports.getAllCategories = async function (req, res, next) {
//     try {
//         const categories = await Category.find();
//         res.status(200).json({
//             status: 'success',
//             categories
//         })
//     }
//     catch (err) {
//         return next(err);
//     }
// }

// exports.updateCategory = async function (req, res, next) {
//     try {
//         const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
//             runValidators: true,
//             new: true
//         })

//         if (!category) throw new ApiError(`Kategorija sa ID-em ${req.params.id} ne postoji.`, 404);
//         res.status(200).json({
//             status: 'success',
//             category
//         })
//     }
//     catch (err) {
//         return next(err);
//     }
// }

// exports.deleteCategory = async function (req, res, next) {
//     try {
//         const category = await Category.findByIdAndDelete(req.params.id);

//         if (!category) throw new ApiError(`Kategorija sa ID-em ${req.params.id} ne postoji.`, 404);

//         res.status(204).json({
//             status: 'success',
//             data: null
//         });
//     }
//     catch (err) {
//         return next(err);
//     }
// }
