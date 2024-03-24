'use strict'

const express = require('express');
const AuthController = require('../controllers/AuthController');
const UserRouter = express.Router();


UserRouter.route('/register').post(AuthController.register);
UserRouter.route('/log-in').post(AuthController.logIn);
UserRouter.route('/me').get(AuthController.isLoggedIn, AuthController.getMyProfile);

module.exports = UserRouter;

