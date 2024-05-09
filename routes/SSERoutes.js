'use strict'

const express = require('express');

const SSEController = require('../controllers/SSEController');
const SSERouter = express.Router();

SSERouter.route('/:id').get(SSEController.getQuiz, SSEController.prepareEmission);


module.exports = SSERouter;