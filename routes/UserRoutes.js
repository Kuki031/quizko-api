'use strict'

const express = require('express');
const AuthController = require('../controllers/AuthController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const UserRouter = express.Router();


UserRouter.route('/register').post(AuthController.register);
UserRouter.route('/log-in').post(AuthController.logIn);


UserRouter.use(isLoggedIn);
UserRouter.route('/me').get(AuthController.getMyProfile);
UserRouter.route('/update-me').patch(AuthController.updateMe);
UserRouter.route('/change-password').patch(AuthController.changePassword);
UserRouter.route('/delete-me').delete(AuthController.deleteMyAccount);
UserRouter.route('/log-out').post(AuthController.logOut);

module.exports = UserRouter;

