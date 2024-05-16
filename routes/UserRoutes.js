'use strict'

const express = require('express');
const AuthController = require('../controllers/AuthController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const hasConfirmedEmail = require('../middlewares/hasConfirmedEmail');
const UserRouter = express.Router();


UserRouter.route('/register').post(AuthController.register);
UserRouter.route('/log-in').post(AuthController.logIn);
UserRouter.route('/confirm-email/:id/:token').patch(AuthController.confirmEmailAddress);

UserRouter.use(isLoggedIn);
UserRouter.route('/resend-email').patch(AuthController.resendEmail);
UserRouter.route('/me').get(AuthController.getMyProfile);
UserRouter.route('/log-out').post(AuthController.logOut);

UserRouter.use(hasConfirmedEmail);
UserRouter.route('/update-me').patch(AuthController.updateMe);
UserRouter.route('/change-password').patch(AuthController.changePassword);
UserRouter.route('/delete-me').delete(AuthController.deleteMyAccount);

module.exports = UserRouter;

