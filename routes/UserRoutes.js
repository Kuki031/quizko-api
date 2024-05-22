'use strict'

const express = require('express');
const AuthController = require('../controllers/AuthController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const limiter = require('../utils/RateLimiting');
const UserRouter = express.Router();


UserRouter.route('/register').post(AuthController.register);
UserRouter.route('/log-in').post(AuthController.logIn);
UserRouter.route('/confirm-email/:id/:token').patch(AuthController.confirmEmailAddress);
UserRouter.route('/forgot-password').patch(limiter, AuthController.forgotPassword);
UserRouter.route('/reset-password/:id/:token').patch(AuthController.resetPassword);

UserRouter.use(isLoggedIn);
UserRouter.route('/resend-email').patch(limiter, AuthController.resendEmail);
UserRouter.route('/me').get(AuthController.getMyProfile);
UserRouter.route('/log-out').post(AuthController.logOut);

UserRouter.use(hasConfirmedEmail);
UserRouter.route('/update-me').patch(AuthController.updateMe);
UserRouter.route('/change-password').patch(AuthController.changePassword);
UserRouter.route('/delete-me').delete(AuthController.deleteMyAccount);

module.exports = UserRouter;

