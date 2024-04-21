// 'use strict'

// const express = require('express');
// const CategoryController = require('../controllers/CategoryController');
// const isLoggedIn = require('../middlewares/isLoggedIn');
// const restrictAccess = require('../middlewares/restrictAccess');


// const categoryRouter = express.Router();

// categoryRouter.route('/all').get(CategoryController.getAllCategories);
// categoryRouter.route('/:id').get(CategoryController.getCategory);


// categoryRouter.use(isLoggedIn, restrictAccess);
// categoryRouter.route('/new-category').post(CategoryController.createCategory);
// categoryRouter.route('/update-category/:id').patch(CategoryController.updateCategory);
// categoryRouter.route('/delete-category/:id').delete(CategoryController.deleteCategory);


// module.exports = categoryRouter;