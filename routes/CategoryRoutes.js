'use strict'

const express = require('express');
const cacheService = require("express-api-cache");
const cache = cacheService.cache;
const CategoryController = require('../controllers/CategoryController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const categoryRouter = express.Router();


categoryRouter.use(isLoggedIn, hasConfirmedEmail);
categoryRouter.route('/').post(CategoryController.createCategory).get(cache("10 minutes"), CategoryController.getAllCategories);
categoryRouter.route('/my-categories').get(cache("5 minutes"), CategoryController.getUserCategories);
categoryRouter.route('/quizzes-by-category').get(cache("10 minutes"), CategoryController.getQuizzesByCategories);
categoryRouter.route('/:id').get(CategoryController.getSingleCategory).patch(CategoryController.updateCategory);


module.exports = categoryRouter;
