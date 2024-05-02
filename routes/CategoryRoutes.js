'use strict'

const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const restrictAccess = require('../middlewares/restrictAccess');
const categoryRouter = express.Router();


categoryRouter.use(isLoggedIn, restrictAccess);
categoryRouter.route('/').post(CategoryController.createCategory).get(CategoryController.getAllCategories);
categoryRouter.route('/quizzes-by-category').get(CategoryController.getQuizzesByCategories);
categoryRouter.route('/:id').get(CategoryController.getSingleCategory).patch(CategoryController.updateCategory);


module.exports = categoryRouter;
